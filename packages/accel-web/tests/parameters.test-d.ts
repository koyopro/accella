import z from "zod";
import { RequestParameters } from "src/parameters";

test("RequestParameters", async () => {
  const request = new Request("http://example.com?page=1");
  const params = await RequestParameters.from(request);

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
    expectTypeOf(result).toEqualTypeOf<{
      account: { name: string; age: number };
      page: string;
      tags: string[];
    }>();
  }
  expectTypeOf(params["page"]).toEqualTypeOf<any>();
});
