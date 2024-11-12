import { execSync } from "child_process";
import { downloadTemplate } from "giget";

(async () => {
  const project = process.argv[2] || "hello-accella";

  await downloadTemplate("github:koyopro/accella/examples/template#feature/accella", {
    dir: project,
  });

  // パッケージのインストール
  process.chdir(project);
  execSync("npm install", { stdio: "inherit" });

  console.log(`Project ${project} has been created successfully.`);
})();
