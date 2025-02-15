import i18next from "i18next";

export default async () => {
  await i18next.init({ lng: "en", resources: { en } });
};

const en = {
  translation: {
    // "accelrecord.models.User": "User",
    // "accelrecord.attributes.User.firstName": "First Name",
    // "accelrecord.attributes.User.lastName": "Last Name",
  },
};
