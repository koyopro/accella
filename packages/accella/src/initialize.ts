import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";

export const runInitializers = async () => {
  loadDotenvs();
  const modules = import.meta.glob("/src/config/initializers/*");
  for (const path in modules) {
    try {
      const initializer = ((await modules[path]()) as any).default;
      if (initializer && typeof initializer === "function") await initializer();
    } catch (error) {
      console.warn(`Error running initializer of ${path}`, error);
    }
  }
};

export const loadDotenvs = () => {
  const path = [".env.local", `.env.${process.env.NODE_ENV}`, ".env"];
  dotenvExpand.expand(dotenv.config({ path }));
};
