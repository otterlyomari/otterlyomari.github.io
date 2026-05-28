import fs from "fs";
import { execSync } from "child_process";

const ledgerPath = "public/deploy-ledger.json";
const version = process.argv[2] || "unknown";

// ----------------------
// helpers
// ----------------------
function run(cmd, env = {}) {
  execSync(cmd, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...env,
    },
  });
}

// ----------------------
// 1. WRITE DEPLOY LEDGER
// ----------------------
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

  ledger = ledger.slice(0, 20);

  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));

  console.log("📦 Ledger updated");
}

// ----------------------
// 2. BUILD ASTRO
// ----------------------
function build() {
  console.log("🔧 Building project...");
  run("npm run build");
}

// ----------------------
// 3. DEPLOY TO CLOUDFLARE
// ----------------------
function deploy() {
  console.log("☁️ Deploying to Cloudflare...");

  if (!process.env.CF_API_TOKEN) {
    console.error("❌ Missing CF_API_TOKEN");
    process.exit(1);
  }

  run(
    `npx wrangler deploy --message "${version}"`,
    {
      CLOUDFLARE_API_TOKEN: process.env.CF_API_TOKEN,
    }
  );
}

// ----------------------
// 4. UPLOAD ROLLBACK SNAPSHOT
// ----------------------
function snapshot() {
  console.log("🧷 Uploading rollback snapshot...");

  run("npx wrangler versions upload", {
    CLOUDFLARE_API_TOKEN: process.env.CF_API_TOKEN,
  });
}

// ----------------------
// RUN PIPELINE
// ----------------------
function runPipeline() {
  console.log(`🚀 Starting deploy: ${version}`);

  writeLedger();
  build();
  deploy();
  snapshot();

  console.log(`✅ Deploy complete: ${version}`);
}

runPipeline();