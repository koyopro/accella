import { DMMF } from '@prisma/generator-helper'

function toSnakeCase(str: string): string {
  return str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '')
}

export const getModel = (model: DMMF.Model) => {
  const table = model.dbName ?? toSnakeCase(model.name)
  return `import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class ${model.name} extends ApplicationRecord {
  static table = "${table}" as const;
}

registerModel(${model.name});
`;
}
