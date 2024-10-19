import { defineFactory } from "accel-record-factory";
import { Todo } from "../../src/models/index.js";

export const TodoFactory = defineFactory(Todo, {
  // title: "MyString",
  // content: "MyString",
  // estimate: 1,
  // dueDate: new Date(),
  // accountId: 1
});

export { TodoFactory as $Todo };
