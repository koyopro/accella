import { $Account } from "tests/factories/account";

export const createDummyAccounts = () => {
  $Account.createList(50);
};
