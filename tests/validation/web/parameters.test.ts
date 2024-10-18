import { ParameterMissing, RequestParameters } from "accel-web";
import z from "zod";

test("RequestParameters", async () => {
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
  const params = await RequestParameters.parse(request);

  expect(params.permit("page", "tags", "priority", "foo")).toEqual({
    page: "1",
    tags: ["good", "human"],
    priority: undefined,
    foo: undefined,
  });

  const account = params.require("account").permit("name", "age");
  expect(account).toEqual({ name: "John", age: 30 });

  expect(() => params.require("foo")).toThrowError(ParameterMissing);

  expect(params.toHash()).toEqual({
    account: {
      age: 30,
      name: "John",
    },
    page: "1",
    tags: ["good", "human"],
  });

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
