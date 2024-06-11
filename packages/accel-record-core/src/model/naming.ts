type i18n = {
  t: (key: string, name: string) => string | undefined;
};
export let i18n: i18n | undefined = undefined;

export class Naming {
  static get modelName() {
    const default_ = this.name;
    const key = `accelrecord.models.${toSnakeCase(default_)}`;
    return {
      get human() {
        return i18n?.t(key, default_) ?? default_;
      },
    };
  }

  static humanAttributeName(attribute: string) {
    const default_ = toPascalCase(attribute);
    const key = `accelrecord.attributes.${toSnakeCase(this.name)}.${toSnakeCase(attribute)}`;
    return i18n?.t(key, default_) ?? default_;
  }
}

const toSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (s) => "_" + s.toLowerCase()).replace(/^_/, "");
};

const toPascalCase = (str: string) => {
  return str
    .replace(/_./g, (s) => s[1].toUpperCase())
    .replace(/^./, (s) => s.toUpperCase());
};

export const loadI18n = async () => {
  try {
    i18n = await import("i18next");
  } catch (e) {
    // i18next not found
  }
};
