import { execSync } from "child_process";

const tag = process.argv[2];

if (!tag) {
  console.log("\nAvailable tags:\n");
  const tags = execSync("git tag", { encoding: "utf-8" })
    .split("\n")
    .filter(Boolean)
    .slice(-10)
    .reverse();

  console.log(tags.join("\n") || "No tags found.");
  process.exit(0);
}

// verify tag exists
const exists = execSync(`git tag -l "${tag}"`, { encoding: "utf-8" }).trim();

if (!exists) {
  console.error(`❌ Tag "${tag}" does not exist.`);
  process.exit(1);
}

console.log(`Rolling back to ${tag}...`);

execSync(`git checkout ${tag}`, { stdio: "inherit" });
execSync(`npm ci`, { stdio: "inherit" });
execSync(`npm run build`, { stdio: "inherit" });
execSync(`npx wrangler deploy`, { stdio: "inherit" });

console.log(`✅ Rolled back to ${tag}`);