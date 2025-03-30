import { Account } from "../models";

export default () => {
  const count = Account.count();
  console.log(`Total accounts: ${count}`);
};
