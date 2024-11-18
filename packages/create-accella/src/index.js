#!/usr/bin/env node

import { execSync } from "child_process";
import { downloadTemplate } from "giget";

(async () => {
  const project = process.argv[2] || "hello-accella";

  await downloadTemplate("github:koyopro/accella/examples/basics", {
    dir: project,
  });

  process.chdir(project);
  execSync("npm install", { stdio: "inherit" });

  console.log(`Project ${project} has been created successfully.`);
})();
