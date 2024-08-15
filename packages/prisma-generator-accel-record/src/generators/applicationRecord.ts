import { GeneratorOptions } from "@prisma/generator-helper";
import * as fs from "fs";
import path from "path";
import { writeFileSafely } from "../utils/writeFileSafely";

export const ensureApplicationRecord = async (options: GeneratorOptions) => {
  const filePath = path.join(
    options.generator.output!.value!,
    `applicationRecord.ts`
  );
  if (!fs.existsSync(filePath)) {
    await writeFileSafely(filePath, generateApplicationRecord());
  }
};

const generateApplicationRecord = () => {
  return `import { Model } from "accel-record";

export class ApplicationRecord extends Model {
  // Implement methods
}
`;
};
