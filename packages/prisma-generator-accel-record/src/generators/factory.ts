import { DMMF } from "@prisma/generator-helper";

export const generateFactory = (model: DMMF.Model) => {
  return `import { defineFactory } from "accel-record-factory";
import { ${model.name} } from "../models/index.js";

export const ${model.name}Factory = defineFactory(${model.name}, {
  ${model.fields
    .filter((f) => !f.isId && !f.relationName && !f.isUpdatedAt && !f.default)
    .map((field) => `// ${field.name}: ${value(field)}`)
    .join(",\n  ")}
});

export { ${model.name}Factory as $${model.name} };
`;
};

const value = (field: DMMF.Field) => {
  switch (field.type) {
    case "BigInt":
    case "Decimal":
    case "Float":
    case "Int":
      return 1;
    case "Bytes":
    case "String":
      return '"MyString"';
    case "Boolean":
      return true;
    case "DateTime":
      return "new Date()";
    case "Json":
      return "{}";
    default:
      return undefined;
  }
};
