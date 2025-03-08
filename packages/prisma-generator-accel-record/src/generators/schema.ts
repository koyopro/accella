import * as fsPromises from "fs/promises";
import { GeneratorOptions } from "@prisma/generator-helper";
import path from "path";

export const ACCEL_RECORD_DIR = ".accel-record";
export const SCHEMA_CONFIG_FILE = "index";

export async function writeSchemaFile(options: GeneratorOptions): Promise<void> {
  const outputPath = options.generator.output!.value!;
  const projectRoot = path.resolve(outputPath, "../..");
  const accelDir = path.join(projectRoot, "node_modules", ACCEL_RECORD_DIR);

  await createDirectory(accelDir);

  await writeJSFile(accelDir, options);
  await writeTypeDefinitionFile(accelDir);
  await writePackageJsonFile(accelDir);
}

async function createDirectory(dirPath: string): Promise<void> {
  await fsPromises.mkdir(dirPath, { recursive: true });
}

async function writeJSFile(accelDir: string, options: GeneratorOptions): Promise<void> {
  const content = generateSchemaFileContent(options);
  const filePath = path.join(accelDir, SCHEMA_CONFIG_FILE + ".js");
  await fsPromises.writeFile(filePath, content, "utf8");
}

async function writeTypeDefinitionFile(accelDir: string): Promise<void> {
  const typesContent = `import { type DataSource } from "@prisma/generator-helper";

export const schemaDir: string;
export const sourceFilePath: string;
export const dataSource: DataSource;
`;
  const typeFilePath = path.join(accelDir, SCHEMA_CONFIG_FILE + ".d.ts");
  await fsPromises.writeFile(typeFilePath, typesContent, "utf8");
}

async function writePackageJsonFile(accelDir: string): Promise<void> {
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
  const absoluteSourceFilePath = sourceFilePath;

  return `
module.exports.schemaDir = "${absoluteSchemaDir.replace(/\\/g, "\\\\")}/";
module.exports.sourceFilePath = "${absoluteSourceFilePath.replace(/\\/g, "\\\\")}";
module.exports.dataSource = ${JSON.stringify(dataSource, null, 2)};
`;
}
