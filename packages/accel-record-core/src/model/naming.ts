type i18n = {
  t: (key: string, name: string) => string | undefined;
};
export let i18n: i18n | undefined = undefined;

export class Naming {
  static get modelName() {
    const default_ = this.name;
    const key = `accelrecord.models.${this.name}`;
    return {
      get human() {
        return i18n?.t(key, "") || default_;
      },
    };
  }

  static humanAttributeName(attribute: string) {
    const key = `accelrecord.attributes.${this.name}.${attribute}`;
    return i18n?.t(key, "") || toPascalCase(attribute);
  }
}

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
