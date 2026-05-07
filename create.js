#!/usr/bin/env node
import fs from "fs";
import { createInterface } from "readline/promises";
import { execSync } from "child_process";

function isValidProjectName(name) {
  if (!name || typeof name !== "string") return false;

  const trimmed = name.trim();
  if (trimmed.length === 0) return false;

  // Check for path traversal or absolute paths
  if (
    trimmed.includes("..") ||
    trimmed.startsWith("/") ||
    trimmed.includes(":")
  ) {
    return false;
  }

  // NPM Package Name Regex
  // Based on npm's rules: lowercase, alphanumeric, -, _, ., no spaces
  // Must not start with . or _
  // Max length 214 chars
  const npmRegex = /^(?!.*\.\.)(?!^\.|_)[a-z0-9._-]+$/;

  if (!npmRegex.test(trimmed)) {
    return false;
  }

  return true;
}

const html = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8"/>
    </head>
    <body>
        <script type="module" src="build.js"></script>
    </body>
</html>`;

const js = `const header = document.createElement("h1");
const helloWorld = document.createTextNode("Hello World!");

header.appendChild(helloWorld);
document.body.appendChild(header);

console.log("hello world!");
`;

const dependencies = [];
const devDependencies = ["esbuild"];
const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log(`🚀 Creating a new project...`);

let projectName;
let projectDesc;

try {
  projectName = await rl.question("Project Name: ");
  if (!isValidProjectName(projectName)) throw new Error();

  projectDesc = await rl.question("Project Description: ");
} catch (error) {
  console.error("Invalid project name.");
  console.error(
    "   - Must be lowercase, alphanumeric, hyphens, underscores, or dots.",
  );
  console.error("   - Cannot start with a dot or underscore.");
  console.error("   - Cannot contain spaces or path separators.");
  process.exit(1);
}

rl.close();

console.log(`Creating project: ${projectName}`);

// Scaffold files
const initialPackageJson = {
  name: projectName,
  version: "1.0.0",
  description: projectDesc,
  author: "ORIF Pomy Intersection",
  type: "module",
  main: "index.js",
  scripts: {
    serve:
      "esbuild index.js --bundle --outfile=public/build.js --format=esm --watch --serve --servedir=public",
    build:
      "esbuild index.js --bundle --format=esm --minify --outfile=public/build.js",
  },
};

fs.writeFileSync(
  "frontend/package.json",
  JSON.stringify(initialPackageJson, null, 2),
);
fs.writeFileSync("frontend/index.js", js);
fs.writeFileSync("frontend/public/index.html", html);
fs.writeFileSync("README.md", `Documentation pour ${projectName}`);

try {
  if (dependencies.length > 0)
    execSync(`npm install ${dependencies.join(" ")}`, {
      stdio: "inherit", // This pipes the output to your terminal so the user sees progress
      cwd: "frontend",
    });
  if (devDependencies.length > 0)
    execSync(`npm install ${devDependencies.join(" ")} --save-dev`, {
      stdio: "inherit", // This pipes the output to your terminal so the user sees progress
      cwd: "frontend",
    });
  console.log(`✅ Dependencies installed successfully.`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

fs.rmSync("package.json");
fs.rmSync("create.js");
console.log(`✅ Project created successfully.`);
