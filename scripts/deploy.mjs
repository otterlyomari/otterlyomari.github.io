import fs from "fs";
import { execSync } from "child_process";

const ledgerPath = "public/deploy-ledger.json";
const version = process.argv[2] || "unknown";

function run(cmd, env = {}) {
  execSync(cmd, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...env,
    },
  });
}

function writeLedger() {
  let ledger = [];

  if (fs.existsSync(ledgerPath)) {
    try {
      ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8"));
    } catch {
      ledger = [];
    }
  }

  ledger.unshift({
    version,
    time: new Date().toISOString(),
  });

  fs.writeFileSync(ledgerPath, JSON.stringify(ledger.slice(0, 20), null, 2));
  console.log("📦 Ledger updated");
}

function build() {
  console.log("🔧 Building...");
  run("npm run build");
}

function deploy() {
  console.log("☁️ Deploying to Cloudflare...");

  if (!process.env.CF_API_TOKEN) {
    console.error("❌ Missing CF_API_TOKEN");
    console.error("Available env keys:", Object.keys(process.env));
    process.exit(1);
   }

  run("npx wrangler deploy --message \"" + version + "\"", {
    CLOUDFLARE_API_TOKEN: process.env.CF_API_TOKEN,
  });
}

function snapshot() {
  console.log("🧷 Snapshot...");
  run("npx wrangler versions upload", {
    CLOUDFLARE_API_TOKEN: process.env.CF_API_TOKEN,
  });
}

function main() {
  console.log(`🚀 Deploy starting: ${version}`);

  writeLedger();
  build();
  deploy();
  snapshot();

  console.log(`✅ Deploy complete: ${version}`);
}

main();