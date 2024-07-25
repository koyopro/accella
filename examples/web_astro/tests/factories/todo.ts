import { defineFactory } from "accel-record-factory";
import { Todo } from "../../src/models/index.js";

export const TodoFactory = defineFactory(Todo, {
  // title: "MyString",
  // content: "MyString",
  // accountId: 1
});

export { TodoFactory as $Todo };
