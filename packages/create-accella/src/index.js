#!/usr/bin/env node

import { execSync } from "child_process";
import { randomBytes } from "crypto";
import { appendFileSync } from "fs";
import { downloadTemplate } from "giget";
import path from "path";

(async () => {
  const project = process.argv[2] || "hello-accella";

  await downloadTemplate("github:koyopro/accella/examples/basics", {
    dir: project,
  });
  const secretKeyBase = randomBytes(64).toString("hex");
  appendFileSync(path.join(project, ".env"), `SECRET_KEY_BASE=${secretKeyBase}\n`);

  process.chdir(project);
  execSync("npm install", { stdio: "inherit" });

  console.log(`Project ${project} has been created successfully.`);
})();
