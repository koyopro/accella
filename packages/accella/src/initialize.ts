import fg from "fast-glob";
import { Accel } from "./index.js";

export const runInitializers = async () => {
  const dir = Accel.root.child("src/config/initializers/");
  const files = await fg.glob(`*.{ts,js,mjs,cjs}`, { cwd: dir.toString() });
  for (const file of files) {
    const path = dir.child(file).toString();
    try {
      const initializer = (await import(/* @vite-ignore */ path)).default;
      if (initializer && typeof initializer === "function") await initializer();
    } catch (error) {
      console.warn(`Error running initializer of ${path}`, error);
    }
  }
};
