import { searchFormFor } from "accel-web";
import { User } from "../models";

test("searchFormFor", async () => {
  const search = User.search({});
  const { Form, TextField, Submit } = searchFormFor(search, { namespace: "query" });
  expect(Form).toBeDefined();
  expect(TextField).toBeDefined();
  expect(Submit).toBeDefined();
});
