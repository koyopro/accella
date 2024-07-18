import { GeneratorOptions } from "@prisma/generator-helper";
import path from "path";
import { ModelWrapper } from "./wrapper";

const loadModels = async (options: GeneratorOptions) => {
  const outputDir = options.generator.output?.value!;
  const filePath = path.join(outputDir, "index.ts");
  const outfile = path.join(__dirname, "../.models.mjs");
  try {
    const { buildSync } = await import("esbuild");
    buildSync({
      entryPoints: [filePath],
      outfile: outfile,
      bundle: true,
      platform: "node",
      format: "esm",
      sourcemap: false,
      allowOverwrite: true,
      packages: "external",
      target: "node18",
    });
    return await eval(`import('${outfile}')`);
  } catch {
    console.log(
      [
        `[prisma-generator-accel-record] Warning: Failed to load models from '${filePath}'.`,
        "Some features (such as scope) require esbuild 0.21.0 or higher.",
      ].join(" ")
    );
    return undefined;
  }
};

const getScopeMethods = <T extends Function>(cls: T) => {
  const properties: string[] = [];
  let currentCls = cls;

  while (currentCls) {
    Object.getOwnPropertyNames(currentCls).forEach((prop) => {
      const desc = Object.getOwnPropertyDescriptor(currentCls, prop);
      if (!desc || typeof desc.get === "function") return;
      if ((currentCls as any)[prop]?.isAccelRecordScope) {
        properties.push(prop);
      }
    });

    currentCls = Object.getPrototypeOf(currentCls);
    if (currentCls === Function.prototype) {
      break;
    }
  }

  return properties;
};

export const relationMethods = async (options: GeneratorOptions) => {
  const m = await loadModels(options);
  if (m == undefined) return "";
  const methods = {} as Record<string, ModelWrapper[]>;
  for (const _model of options.dmmf.datamodel.models) {
    const model = new ModelWrapper(_model, options.dmmf.datamodel);
    const definedModel = m[model.persistedModel];
    if (!definedModel) continue;
    for (const method of getScopeMethods(definedModel)) {
      (methods[method] ||= []).push(model);
    }
  }
  return (
    Object.entries(methods)
      .map(([name, models]) => {
        const ts = models.map(
          (m) =>
            `T extends ${m.persistedModel} ? typeof ${m.baseModel}['${name}'] : `
        );
        return `\n    ${name}: (${ts.join("")}never);`;
      })
      .join("") + "\n  "
  );
};
