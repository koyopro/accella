import { ZodError } from "astro/zod";
import { RequestParameters } from "src/parameters";
import z from "zod";

const buildParams = async () => {
  const data = new FormData();
  data.append("account.name", "John");
  data.append("+account.age", "30");
  data.append("tags[]", "good");
  data.append("tags[]", "human");
  data.append("+priority", "");
  const request = new Request("http://example.com?page=1", {
    method: "POST",
    body: data,
  });
  const params = await RequestParameters.from(request);
  return params;
};

test("RequestParameters", async () => {
  const params = await buildParams();

  expect(params.permit("page", "tags", "priority", "foo")).toEqual({
    page: "1",
    tags: ["good", "human"],
    priority: undefined,
    foo: undefined,
  });

  const account = params.require("account").permit("name", "age");
  expect(account).toEqual({ name: "John", age: 30 });

  expect(params["page"]).toEqual("1");
  expect(params["tags"]).toEqual(["good", "human"]);
  expect(params["account"]).toEqual({ name: "John", age: 30 });
  expect(params["foo"]).toBeUndefined();
});

test("RequestParameters toHash()", async () => {
  const params = await buildParams();

  expect(params.toHash()).toEqual({
    account: {
      age: 30,
      name: "John",
    },
    page: "1",
    tags: ["good", "human"],
  });
});

test("RequestParameters parseWith()", async () => {
  const params = await buildParams();

  {
    const result = params.parseWith(
      z.object({
        account: z.object({
          name: z.string(),
          age: z.number().min(0),
        }),
        page: z.string().default("1"),
        tags: z.array(z.string()),
      })
    );
    expect(result).toEqual({
      account: { name: "John", age: 30 },
      page: "1",
      tags: ["good", "human"],
    });
  }
});

test("RequestParameters safeParseWith()", async () => {
  const params = await buildParams();
  {
    const result = params.safeParseWith(
      z.object({
        priority: z.number(),
      })
    );
    expect(result.success).toBe(false);
  }
  {
    const result = params.safeParseWith(
      z.object({
        priority: z.number().optional(),
      })
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ priority: undefined });
  }
});

test("RequestParameters errors", async () => {
  const params = await buildParams();

  expect(() => params.require("foo")).toThrowError(ZodError);
  expect(() => params.require("page")).not.toThrowError();

  expect(() => {
    params.parseWith(z.object({ foo: z.string() }));
  }).toThrowError(ZodError);
});
