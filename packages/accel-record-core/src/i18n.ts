type i18n = {
  t: (key: string, defaults: string | undefined) => string | undefined;
};
export let i18n: i18n | undefined = undefined;

export const loadI18n = async () => {
  try {
    // @ts-ignore
    i18n = await import("i18next");
  } catch (e) {
    // i18next not found
  }
};

const translate = (key: string, defaults?: string | undefined) =>
  i18n?.t(key, defaults);

export const I18n = {
  t: translate,
  translate,
};
