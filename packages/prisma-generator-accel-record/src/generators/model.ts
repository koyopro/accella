import { DMMF } from "@prisma/generator-helper";

export const getModel = (model: DMMF.Model) => {
  return `import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class ${model.name} extends ApplicationRecord {

}

registerModel(${model.name});
`;
};
