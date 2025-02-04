import { DMMF, GeneratorOptions } from "@prisma/generator-helper";
import path, { dirname } from "path";
import { generateTypes } from "./type";

export const generateIndex = async (options: GeneratorOptions) => {
  return [
    cautionComment,
    generateExportAllModels(options.dmmf.datamodel.models as DMMF.Model[]),
    await generateTypes(options),
    generateSchema(options),
  ].join("\n");
};

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
  const { sourceFilePath: _, ...dataSource } = db as any;
  return `
export const schemaDir = "${schemaDir}/";
export const dataSource = ${JSON.stringify(dataSource, null, 2)} as DataSource;

/**
 * Retrieves the database connection settings based on the Prisma schema file.
 */
export const getDatabaseConfig = () => generateDatabaseConfig(dataSource, import.meta.url, schemaDir);
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
