import { ParameterMissing, RequestParameters } from "accel-web";

test("RequestParameters", async () => {
  const data = new FormData();
  data.append("account.name", "John");
  data.append("account.age", "30");
  data.append("tags[]", "good");
  data.append("tags[]", "human");
  const request = new Request("http://example.com?page=1", {
    method: "POST",
    body: data,
  });
  const params = await RequestParameters.parse(request);

  expect(params.permit("page", "tags", "foo")).toEqual({
    page: "1",
    tags: ["good", "human"],
    foo: undefined,
  });

  const account = params.require("account").permit("name", "age");
  expect(account).toEqual({ name: "John", age: "30" });

  expect(() => params.require("foo")).toThrowError(ParameterMissing);

  expect(params.toHash()).toEqual({
    account: {
      age: "30",
      name: "John",
    },
    page: "1",
    tags: ["good", "human"],
  });
});
