import { registerModel } from "accel-record-core";
import { ApplicationRecord } from "./applicationRecord";

export class Post extends ApplicationRecord {}

registerModel(Post);
