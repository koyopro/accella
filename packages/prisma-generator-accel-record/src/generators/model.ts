import { DMMF } from "@prisma/generator-helper";

export const getModel = (model: DMMF.Model) => {
  const table = model.dbName ? `  static table = "${model.dbName}";\n` : "";
  return `import { registerModel } from "accel-record";
import { ApplicationRecord } from "./applicationRecord";

export class ${model.name} extends ApplicationRecord {
${table}
}

registerModel(${model.name});
`;
};
