import { defineFactory } from "accel-record-factory";
import { Author } from "../models/index.js";

export const AuthorFactory = defineFactory(Author, {
  // firstName: "MyString",
  // lastName: "MyString"
});

export { AuthorFactory as $Author };
