export const runInitializers = async () => {
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
