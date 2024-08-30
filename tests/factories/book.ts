import { defineFactory } from "accel-record-factory";
import { Book } from "../models/index.js";

export const BookFactory = defineFactory(Book, {
  // title: "MyString",
  // authorFirstName: "MyString",
  // authorLastName: "MyString"
});

export { BookFactory as $Book };
