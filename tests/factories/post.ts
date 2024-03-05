import { Post } from "../models/post.js";
import { defineFactory } from "accel-record-factory";

export const PostFactory = defineFactory(Post, ({ seq }) => ({
  title: `title${seq}`,
  body: `body${seq}`,
  authorId: 1,
}));

export { PostFactory as $post };
