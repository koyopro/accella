import { execSync } from "child_process";
import path from "path";
import fs from "fs";

// プロジェクト名を取得
const projectName = process.argv[2] || "accella-project";
const projectPath = path.join(process.cwd(), projectName);

// プロジェクトディレクトリを作成
if (!fs.existsSync(projectPath)) {
  fs.mkdirSync(projectPath);
}

// テンプレートプロジェクトをクローン
const templateRepo = "git@github.com:koyopro/astro-cookie-session.git";
execSync(`git clone ${templateRepo} ${projectPath}`, { stdio: "inherit" });

// プロジェクトディレクトリに移動
process.chdir(projectPath);

// Gitディレクトリを削除
fs.rmSync(path.join(projectPath, ".git"), { recursive: true, force: true });

// パッケージのインストール
// execSync("npm install", { stdio: "inherit" });

console.log(`Project ${projectName} has been created successfully.`);
