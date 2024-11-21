import { experimental_AstroContainer as AstroContainer } from "astro/container";
import MyForm from "./MyForm.astro";

test("formFor() with FormModel", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(MyForm);

  expect(result).toContain('htmlFor="sampleForm.count"');
});
