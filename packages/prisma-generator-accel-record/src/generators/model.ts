import { DMMF } from "@prisma/generator-helper";

export const getModel = (model: DMMF.Model) => {
  const table = model.dbName ? `  static table = "${model.dbName}";\n` : "";
  return `import { ApplicationRecord } from "./applicationRecord";

export class ${model.name}Model extends ApplicationRecord {
${table}
}
`;
};
