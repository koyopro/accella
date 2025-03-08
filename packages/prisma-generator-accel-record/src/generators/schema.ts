import * as fsPromises from "fs/promises";
import { GeneratorOptions } from "@prisma/generator-helper";
import path from "path";

export const ACCEL_RECORD_DIR = ".accel-record";
export const SCHEMA_CONFIG_FILE = "index";

// スキーマ設定ファイルを書き出す関数
export async function writeSchemaFile(options: GeneratorOptions): Promise<void> {
  const outputPath = options.generator.output!.value!;
  const projectRoot = path.resolve(outputPath, "../.."); // node_modulesの親ディレクトリを取得
  const accelDir = path.join(projectRoot, "node_modules", ACCEL_RECORD_DIR);

  // ディレクトリが存在しない場合は作成
  await fsPromises.mkdir(accelDir, { recursive: true });

  // スキーマ情報を生成
  const content = generateSchemaFileContent(options);

  // index.js ファイルを書き出し
  const filePath = path.join(accelDir, SCHEMA_CONFIG_FILE + ".js");
  await fsPromises.writeFile(filePath, content, "utf8");

  // index.d.ts 型定義ファイルを書き出し
  const typesContent = `import { type DataSource } from "@prisma/generator-helper";

export const schemaDir: string;
export const sourceFilePath: string;
export const dataSource: DataSource;
`;
  const typeFilePath = path.join(accelDir, SCHEMA_CONFIG_FILE + ".d.ts");
  await fsPromises.writeFile(typeFilePath, typesContent, "utf8");

  // package.json を作成
  const packageJson = {
    name: "@accella-record/schema",
    version: "1.0.0",
    description: "Schema information for Accella Record",
    main: "./index.js",
    types: "./index.d.ts",
    private: true,
  };

  const packageJsonPath = path.join(accelDir, "package.json");
  await fsPromises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");
}

export function generateSchemaFileContent(options: GeneratorOptions): string {
  const absoluteSchemaDir = path.dirname(options.schemaPath);
  const db = options.datasources.find((v) => v.name == "db");

  if (!["mysql", "postgresql", "sqlite"].includes(db?.provider ?? "")) {
    throw new Error(`db provider must be one of mysql, postgresql, sqlite: ${db?.provider}`);
  }

  const { sourceFilePath, ...dataSource } = db as any;
  const absoluteSourceFilePath = sourceFilePath; // すでに絶対パス

  // 出力内容を作成
  return `
module.exports.schemaDir = "${absoluteSchemaDir.replace(/\\/g, "\\\\")}/";
module.exports.sourceFilePath = "${absoluteSourceFilePath.replace(/\\/g, "\\\\")}";
module.exports.dataSource = ${JSON.stringify(dataSource, null, 2)};
`;
}
