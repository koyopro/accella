import { experimental_AstroContainer as AstroContainer } from "astro/container";
import MyForm from "./MyForm.astro";
import MyFormWithNamespace from "./MyFormWithNamespace.astro";

test("formFor() with FormModel", async () => {
  const authenticityToken = "abcd";
  const container = await AstroContainer.create();
  const result = await container.renderToString(MyForm, {
    locals: { authenticityToken },
  });

  expect(result).toContain('htmlFor="sampleForm.count"');
  expect(result).toContain(
    `<input type="hidden" name="authenticity_token" value="${authenticityToken}"`
  );
});

test("formFor() with namespace", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(MyFormWithNamespace);

  expect(result).toContain('htmlFor="q.count"');
});
