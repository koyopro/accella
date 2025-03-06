import { DMMF, GeneratorOptions } from "@prisma/generator-helper";
import path, { dirname } from "path";
import { generateTypes } from "./type";
import * as fs from "fs/promises";
import { mkdirp } from "mkdirp";

// 出力先ディレクトリとファイル名の定数
export const ACCEL_RECORD_DIR = "node_modules/.accel-record";
export const SCHEMA_CONFIG_FILE = "schema-config.js";

export const generateIndex = async (options: GeneratorOptions) => {
  // スキーマ情報をファイルに書き出し
  await writeSchemaToNodeModules(options);

  return [
    cautionComment,
    generateExportAllModels(options.dmmf.datamodel.models as DMMF.Model[]),
    await generateTypes(options),
    generateSchema(options),
  ].join("\n");
};

// スキーマ設定ファイルの内容を生成する関数
export function generateSchemaFileContent(options: GeneratorOptions): string {
  const outputPath = options.generator.output!.value!;

  // 絶対パスの取得
  const absoluteSchemaDir = path.dirname(options.schemaPath);
  const db = options.datasources.find((v) => v.name == "db");

  if (!["mysql", "postgresql", "sqlite"].includes(db?.provider ?? "")) {
    throw new Error(`db provider must be one of mysql, postgresql, sqlite: ${db?.provider}`);
  }

  // sourceFilePath も絶対パスで
  const { sourceFilePath, ...dataSource } = db as any;
  const absoluteSourceFilePath = sourceFilePath; // すでに絶対パス

  // 出力内容を作成
  return `/* eslint-disable */
/***************************************************************
* This file is automatically generated. Please do not modify.
***************************************************************/

export const schemaDir = "${absoluteSchemaDir.replace(/\\/g, "\\\\")}";
export const sourceFilePath = "${absoluteSourceFilePath.replace(/\\/g, "\\\\")}";
export const dataSource = ${JSON.stringify(dataSource, null, 2)};
`;
}

// スキーマ情報をファイルに書き出す関数
async function writeSchemaToNodeModules(options: GeneratorOptions): Promise<void> {
  const outputPath = options.generator.output!.value!;
  const basePath = path.resolve(outputPath, "../.."); // node_modulesの親ディレクトリを取得
  const accelDir = path.join(basePath, ACCEL_RECORD_DIR);

  // ディレクトリが存在しない場合は作成
  await mkdirp(accelDir);

  // スキーマ情報を生成
  const content = generateSchemaFileContent(options);

  // ファイルに書き出し
  await fs.writeFile(path.join(accelDir, SCHEMA_CONFIG_FILE), content, "utf8");
}

const cautionComment = `/* eslint-disable */
/***************************************************************
* This file is automatically generated. Please do not modify.
***************************************************************/

import { type DataSource } from "@prisma/generator-helper";
`;

const generateSchema = (options: GeneratorOptions) => {
  const outputPath = options.generator.output!.value!;
  const relativePath = path.relative(outputPath, options.schemaPath);
  const schemaDir = dirname(relativePath);
  const db = options.datasources.find((v) => v.name == "db");
  if (!["mysql", "postgresql", "sqlite"].includes(db?.provider ?? "")) {
    throw new Error(`db provider must be one of mysql, postgresql, sqlite: ${db?.provider}`);
  }
  // remove sourceFilePath
  const { sourceFilePath, ...dataSource } = db as any;
  return `
import { schemaDir, dataSource, sourceFilePath } from '${ACCEL_RECORD_DIR}/${SCHEMA_CONFIG_FILE}';
export { schemaDir, dataSource, sourceFilePath };

/**
 * Retrieves the database connection settings based on the Prisma schema file.
 */
export const getDatabaseConfig = () => generateDatabaseConfig(dataSource, import.meta.url, schemaDir, sourceFilePath);
`;
};

export const generateExportAllModels = (models: DMMF.Model[]) => {
  return models
    .map((model) =>
      [`import { ${model.name}Model } from './${toCamelCase(model.name)}.js'`].join("\n")
    )
    .join("\n");
};

export function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
