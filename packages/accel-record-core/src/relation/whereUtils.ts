import { andCondition, Condition } from "./options.js";

export const wrapAnd = (conditions: any[]): Condition => {
  return conditions.length === 1 ? conditions[0] : andCondition(conditions);
};

export const makeWhere = (key: string, operator: string, value: string) => {
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
