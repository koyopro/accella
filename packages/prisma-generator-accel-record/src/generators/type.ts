import { GeneratorOptions } from "@prisma/generator-helper";
import { generateModelTypes } from "./model/type.js";
import { relationMethods } from "./relation.js";
import { ModelWrapper } from "./wrapper.js";

export const generateTypes = async (options: GeneratorOptions) => {
  return `import {
  registerModel,
  type Collection,
  type Filter,
  type StringFilter,
} from "accel-record";
import {
  Attribute,
  defineEnumTextAttribute,
} from "accel-record/enums";

declare module "accel-record" {
  function meta<T>(model: T): Meta<T>;

  interface Relation<T, M> {${await relationMethods(options)}}
}

type Meta<T> = ${meta(options)}
               any;
${enumData(options)}${models(options)}`;
};

const models = (options: GeneratorOptions) => {
  let data = "";
  for (const model of options.dmmf.datamodel.models)
    data += generateModelTypes(new ModelWrapper(model, options.dmmf.datamodel));
  return data;
};

const meta = (options: GeneratorOptions) =>
  options.dmmf.datamodel.models
    .map((model) => new ModelWrapper(model, options.dmmf.datamodel))
    .map((model) => `T extends typeof ${model.baseModel} | ${model.baseModel} ? ${model.meta} :`)
    .join("\n               ");

const enumData = (options: GeneratorOptions) => {
  if (options.dmmf.datamodel.enums.length == 0) return "";

  let namespaceData = "";
  let enumData = "";

  for (const enumType of options.dmmf.datamodel.enums) {
    namespaceData += `
  export const ${enumType.name} = {
    ${enumType.values.map((v) => `${v.name}: "${v.name}",`).join("\n    ")}
  } as const;
  export type ${enumType.name} = (typeof ${enumType.name})[keyof typeof ${enumType.name}];`;
    enumData += `
export type ${enumType.name} = $Enums.${enumType.name};
export const ${enumType.name} = $Enums.${enumType.name};`;
  }

  return `
export namespace $Enums {${namespaceData}
}
${enumData}
`;
};
