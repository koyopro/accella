type i18n = {
  t: (key: string, name: string) => string | undefined;
};
let i18n: i18n | undefined = undefined;

export class Naming {
  static get modelName() {
    const name = this.name;
    const key = `accelrecord.models.${toSnakeCase(name)}`;
    return {
      get human() {
        return i18n?.t(key, name) ?? name;
      },
    };
  }
}

const toSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (s) => "_" + s.toLowerCase()).replace(/^_/, "");
};

export const loadI18n = async () => {
  try {
    i18n = await import("i18next");
  } catch (e) {
    // i18next not found
  }
};
