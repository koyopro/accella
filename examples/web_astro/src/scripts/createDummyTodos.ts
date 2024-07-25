import { $Todo } from "../../tests/factories/todo.ts";
import { Account } from "../models";

export const createDummyTodos = (account: Account) => {
  for (let i = 1; i <= 55; i++) {
    $Todo.create({ account });
  }
};
