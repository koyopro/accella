import i18next from "i18next";

export default async () => {
  // return;
  await i18next.init({ lng: "ja", resources: { ja } });
  // await i18next.changeLanguage("en");
};

const ja = {
  translation: {
    "accelrecord.attributes.Account.email": "メールアドレス",
    "accelrecord.attributes.Account.password": "パスワード",
    "accelrecord.attributes.Account.passwordConfirmation": "パスワード(確認用)",

    "accelrecord.attributes.SignIn.email": "メールアドレス",
    "accelrecord.attributes.SignIn.password": "パスワード",

    "accelrecord.attributes.Todo.title": "タイトル",
    "accelrecord.attributes.Todo.estimate": "見積もり",
    "accelrecord.attributes.Todo.dueDate": "期日",
    "accelrecord.attributes.Todo.status": "ステータス",
    "accelrecord.attributes.Todo.available": "有効",
    "accelrecord.attributes.Todo.description": "詳細",

    "enums.Status": "ステータス",
    "enums.Status.OPEN": "オープン",
    "enums.Status.CLOSED": "クローズド",

    "errors.messages.blank": "を入力してください",
    "errors.messages.accepted": "をチェックしてください",
    "errors.messages.invalid": "は不正です",
    "errors.messages.inclusion": "はリストに含まれていません",
    "errors.messages.tooShort": "は短すぎます(%{count}文字以上)",
    "errors.messages.tooLong": "は長すぎます(%{count}文字以下)",
    "errors.messages.taken": "は既に使用されています",
    "errors.messages.confirmation": "と%{attribute}の入力が一致しません",

    // pagination
    "views.pagination.first": "&laquo; 最初",
    "views.pagination.last": "最後 &raquo;",
    "views.pagination.previous": "&lsaquo; 前",
    "views.pagination.next": "次 &rsaquo;",
    "views.pagination.truncate": "&hellip;",

    "helpers.pageEntriesInfo.onePage.displayEntries_zero": "レコードが見つかりませんでした",
    "helpers.pageEntriesInfo.onePage.displayEntries_other": "<b>全{{total}}</b>件表示中",
    "helpers.pageEntriesInfo.morePages.displayEntries":
      "<b>{{first}}-{{last}}</b>件 / {{total}}件中",
  },
};
