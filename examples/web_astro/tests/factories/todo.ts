import { defineFactory } from "accel-record-factory";
import { Todo } from "../../src/models/index.js";
import { faker } from "@faker-js/faker";

export const TodoFactory = defineFactory(Todo, {
  title: () => `buy a ${faker.commerce.productName()}`,
  // content: "MyString",
  // accountId: 1
});

export { TodoFactory as $Todo };
