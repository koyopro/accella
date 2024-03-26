import { ModelMeta, Relation } from "..";

export class Where {
  protected addWhere(
    this: Relation<unknown, ModelMeta>,
    input: ModelMeta["WhereInput"]
  ) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      if (Array.isArray(input[key])) {
        newOptions["wheres"].push([key, "in", input[key]]);
      } else if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          newOptions["wheres"].push(
            makeWhere(key, operator, input[key][operator])
          );
        }
      } else {
        newOptions["wheres"].push({ [key]: input[key] });
      }
    }
    return newOptions;
  }

  protected addWhereNot(
    this: Relation<unknown, ModelMeta>,
    input: ModelMeta["WhereInput"]
  ) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    for (const key in input) {
      if (input[key] != null && typeof input[key] === "object") {
        for (const operator in input[key]) {
          if (operator === "in") {
            newOptions["wheres"].push([key, "not in", input[key][operator]]);
          } else {
            newOptions["whereNots"].push(
              makeWhere(key, operator, input[key][operator])
            );
          }
        }
      } else {
        newOptions["whereNots"].push({ [key]: input[key] });
      }
    }
    return newOptions;
  }

  protected addWhereRaw(
    this: Relation<unknown, ModelMeta>,
    query: string,
    ...bindings: any[]
  ) {
    const newOptions = JSON.parse(JSON.stringify(this.options));
    newOptions["whereRaws"].push([query, bindings]);
    return newOptions;
  }
}

const makeWhere = (key: string, operator: string, value: string) => {
  switch (operator) {
    case "startsWith":
      return [key, "like", `${value}%`];
    case "endsWith":
      return [key, "like", `%${value}`];
    case "contains":
      return [key, "like", `%${value}%`];
    default:
      return [key, operator, value];
  }
};
