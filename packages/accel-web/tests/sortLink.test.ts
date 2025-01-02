import { Model } from "accel-record";
import { attributes } from "accel-record/attributes";
import { Search } from "accel-record/search";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import SortLink from "src/SortLink.astro";

class SampleForm extends Model {
  name = attributes.string();
}

const render = async (options = {}) => {
  const container = await AstroContainer.create();
  return container.renderToString(
    SortLink,
    Object.assign(
      {
        props: {
          q: new Search(SampleForm, {}),
          key: "name",
        },
      },
      options
    )
  );
};

test("SortLink Component", async () => {
  {
    const result = await render();
    expect(result).toContain('<a href="https://example.com/?q.s=name+asc"');
    expect(result).toContain('data-key="name"');
    expect(result).toContain("> Name <");
  }
  {
    const result = await render({
      slots: { default: "UserName" },
      request: new Request("https://foo.com/bar?p=4"),
    });
    expect(result).toContain('<a href="https://foo.com/bar?p=4&q.s=name+asc"');
    expect(result).toContain("> UserName <");
  }
});
