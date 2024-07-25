import { $Todo } from "../../tests/factories/todo.ts";
import { Account } from "../models";

export const createDummyTodos = (account: Account) => {
  const todos = [
    {
      title: "Buy milk",
    },
    {
      title: "Buy eggs",
    },
    {
      title: "Buy bread",
    },
  ];

  for (let i = 1; i <= 30; i++) {
    for (const todo of todos) {
      const { title, ...rest } = todo;
      $Todo.create({ account, title: `${title} ${i}`, ...rest });
    }
  }
};
