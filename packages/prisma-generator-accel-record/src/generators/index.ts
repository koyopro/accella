import { DMMF, GeneratorOptions } from "@prisma/generator-helper";
import { generateTypes } from "./type";

export const generateIndex = (options: GeneratorOptions) => {
  return [
    generateExportAllModels(options.dmmf.datamodel.models as DMMF.Model[]),
    generateTypes(options),
  ].join("\n");
};

export const generateExportAllModels = (models: DMMF.Model[]) => {
  return models
    .map((model) =>
      [
        `import { ${model.name} } from './${toCamelCase(model.name)}.js'`,
        `export { ${model.name} } from './${toCamelCase(model.name)}.js'`,
      ].join("\n")
    )
    .join("\n");
};

export function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
