import { generatorHandler, GeneratorOptions } from "@prisma/generator-helper";
import * as fs from "fs";
import * as fsPromises from "fs/promises";
import path from "path";
import { GENERATOR_NAME } from "./constants";
import { ensureApplicationRecord } from "./generators/applicationRecord";
import { generateFactory } from "./generators/factory";
import {
  ACCEL_RECORD_DIR,
  generateIndex,
  generateSchemaFileContent,
  SCHEMA_CONFIG_FILE,
  toCamelCase,
} from "./generators/index";
import { getModel as generateModel } from "./generators/model";
import { writeFileSafely } from "./utils/writeFileSafely";

// eslint-disable-next-line @typescript-eslint/no-require-imports
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
    const outputDir = options.generator.output!.value!;

    // スキーマ設定ファイルの出力
    await writeSchemaFile(options);

    await writeFileSafely(path.join(outputDir, `_types.ts`), await generateIndex(options));
    const indexFile = path.join(outputDir, `index.ts`);
    if (!fs.existsSync(indexFile)) {
      await writeFileSafely(indexFile, `export * from "./_types.js";\n`);
    }

    await ensureApplicationRecord(options);

    await generateModels(options, outputDir);

    await generateFactories(options, indexFile);
  },
});

// スキーマ設定ファイルを書き出す関数
async function writeSchemaFile(options: GeneratorOptions): Promise<void> {
  const outputPath = options.generator.output!.value!;
  const projectRoot = path.resolve(outputPath, "../.."); // node_modulesの親ディレクトリを取得
  const accelDir = path.join(projectRoot, "node_modules", ACCEL_RECORD_DIR);

  // ディレクトリが存在しない場合は作成
  await fsPromises.mkdir(accelDir, { recursive: true });

  // スキーマ情報を生成
  const content = generateSchemaFileContent(options);

  // schema.js ファイルを書き出し
  const filePath = path.join(accelDir, SCHEMA_CONFIG_FILE + ".js");
  await fsPromises.writeFile(filePath, content, "utf8");
  console.info(`${green("create")}: ${path.relative(currentDir, filePath)}`);

  // schema.d.ts 型定義ファイルを書き出し
  const typesContent = `import { type DataSource } from "@prisma/generator-helper";

export const schemaDir: string;
export const sourceFilePath: string;
export const dataSource: DataSource;
`;
  const typeFilePath = path.join(accelDir, SCHEMA_CONFIG_FILE + ".d.ts");
  await fsPromises.writeFile(typeFilePath, typesContent, "utf8");
  console.info(`${green("create")}: ${path.relative(currentDir, typeFilePath)}`);
}

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

const generateFactories = async (options: GeneratorOptions, indexFile: string) => {
  const factoryDir = options.generator.config.factoryPath;
  if (typeof factoryDir !== "string") return;
  const url = new URL(`${factoryDir}/`, `file://${options.schemaPath}`);
  for (const model of options.dmmf.datamodel.models) {
    const fileName = `${toCamelCase(model.name)}.ts`;
    const filePath = new URL(fileName, url).pathname;
    if (fs.existsSync(filePath)) continue;
    const relative = path.relative(path.dirname(filePath), indexFile).replace(/.ts$/, ".js");
    await writeFileSafely(filePath, generateFactory(model, { pathToIndex: relative }));
    console.info(`${green("create")}: ${path.relative(currentDir, filePath)}`);
  }
};
