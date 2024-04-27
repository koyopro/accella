import { generatorHandler, GeneratorOptions } from "@prisma/generator-helper";
import * as fs from "fs";
import path from "path";
import { GENERATOR_NAME } from "./constants";
import { ensureApplicationRecord } from "./generators/applicationRecord";
import { generateFactory } from "./generators/factory";
import { generateIndex, toCamelCase } from "./generators/index";
import { getModel as generateModel } from "./generators/model";
import { writeFileSafely } from "./utils/writeFileSafely";

const { version } = require("../package.json");

const currentDir = process.cwd();

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
    const indexFile = path.join(outputDir, `index.ts`);
    if (!fs.existsSync(indexFile)) {
      await writeFileSafely(indexFile, `export * from "./_types.js";\n`);
    }

    await ensureApplicationRecord(options);

    await generateModels(options, outputDir);

    await generateFactories(options, indexFile);
  },
});

const green = (text: string) => `\x1b[32m${text}\x1b[39m`;

const generateModels = async (options: GeneratorOptions, outputDir: string) => {
  for (const model of options.dmmf.datamodel.models) {
    const fileName = `${toCamelCase(model.name)}.ts`;
    const filePath = path.join(outputDir, fileName);
    if (fs.existsSync(filePath)) continue;
    await writeFileSafely(filePath, generateModel(model));
    console.info(`${green("create")}: ${path.relative(currentDir, filePath)}`);
  }
};

const generateFactories = async (
  options: GeneratorOptions,
  indexFile: string
) => {
  const factoryDir = options.generator.config.factoryPath;
  if (typeof factoryDir === "string") {
    const prefix = factoryDir.startsWith("/")
      ? ""
      : path.dirname(options.schemaPath);
    for (const model of options.dmmf.datamodel.models) {
      const fileName = `${toCamelCase(model.name)}.ts`;
      const filePath = path.join(prefix, factoryDir, fileName);
      if (fs.existsSync(filePath)) continue;
      const relative = path
        .relative(path.dirname(filePath), indexFile)
        .replace(/.ts$/, ".js");
      await writeFileSafely(
        filePath,
        generateFactory(model, { pathToIndex: relative })
      );
      console.info(
        `${green("create")}: ${path.relative(currentDir, filePath)}`
      );
    }
  }
};
