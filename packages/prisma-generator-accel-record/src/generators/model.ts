import { DMMF } from '@prisma/generator-helper'

function toSnakeCase(str: string): string {
  return str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '')
}

export const getModel = (model: DMMF.Model) => {
  const table = model.dbName ?? toSnakeCase(model.name)
  return `import { Model, registerModel } from "accel-record";

export class ${model.name} extends Model {
  static table = "${table}" as const;
}

registerModel(${model.name});
`
}
