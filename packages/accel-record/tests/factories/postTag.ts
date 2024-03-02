import { PostTag } from "../models/postTag.js";
import { defineFactory } from "accel-record-factory";

export const PostTagFactory = defineFactory(PostTag, ({ seq }) => ({
  name: `tag${seq}`,
}));

export { PostTagFactory as $postTag };
