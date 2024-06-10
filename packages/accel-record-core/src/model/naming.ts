import i18next from "i18next";

export class Naming {
  static get modelName() {
    const name = this.name;
    const key = `accelrecord.models.${toSnakeCase(name)}`;
    return {
      get human() {
        return i18next.t(key, name) ?? name;
      },
    };
  }
}

const toSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (s) => "_" + s.toLowerCase()).replace(/^_/, "");
};
