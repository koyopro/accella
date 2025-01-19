import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getMockSession } from "./mockSession";
import MyForm from "./MyForm.astro";
import MyFormWithNamespace from "./MyFormWithNamespace.astro";

const session = getMockSession();

test("formFor() with FormModel", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(MyForm, {
    locals: { session },
  });

  expect(result).toContain('htmlFor="sampleForm.count"');
  expect(result).toContain('<input type="hidden" name="authenticity_token" value="');
});

test("formFor() with namespace", async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(MyFormWithNamespace);

  expect(result).toContain('htmlFor="q.count"');
});
