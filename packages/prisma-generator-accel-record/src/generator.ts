import { generatorHandler, GeneratorOptions } from "@prisma/generator-helper";
// import { logger } from "@prisma/sdk";
import * as fs from "fs";
import path from "path";
import { GENERATOR_NAME } from "./constants";
import { ensureApplicationRecord } from "./generators/applicationRecord";
import { generateIndex, toCamelCase } from "./generators/index";
import { getModel as generateModel } from "./generators/model";
import { writeFileSafely } from "./utils/writeFileSafely";

const { version } = require("../package.json");

generatorHandler({
  onManifest() {
    return {
      version,
      defaultOutput: "../src/models",
      prettyName: GENERATOR_NAME,
    };
  },
  onGenerate: async (options: GeneratorOptions) => {
    const outputDir = options.generator.output?.value!;
    await writeFileSafely(
      path.join(outputDir, `_types.ts`),
      generateIndex(options)
    );
    await writeFileSafely(
      path.join(outputDir, `index.ts`),
      `export * from "./_types.js";`
    );

    await ensureApplicationRecord(options);

    for (const model of options.dmmf.datamodel.models) {
      const fileName = `${toCamelCase(model.name)}.ts`;
      const filePath = path.join(outputDir, fileName);
      if (fs.existsSync(filePath)) continue;
      await writeFileSafely(filePath, generateModel(model));
      // logger.info(`added: ${fileName}`);
    }
  },
});
