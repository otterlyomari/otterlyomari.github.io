import fs from "fs";
import { execSync } from "child_process";

const ledgerPath = "public/deploy-ledger.json";
const version = process.argv[2] || "unknown";

// ----------------------
// 1. WRITE DEPLOY LEDGER
// ----------------------
function writeLedger() {
  let ledger = [];

  if (fs.existsSync(ledgerPath)) {
    ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8"));
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
  execSync("npm run build", { stdio: "inherit" });
}

// ----------------------
// 3. DEPLOY TO CLOUDFLARE
// ----------------------
function deploy() {
  console.log("☁️ Deploying to Cloudflare...");

  execSync(
    `CLOUDFLARE_API_TOKEN=${process.env.CLOUDFLARE_API_TOKEN} npx wrangler deploy --message "${version}"`,
    { stdio: "inherit" }
  );
}

// ----------------------
// 4. UPLOAD ROLLBACK SNAPSHOT
// ----------------------
function snapshot() {
  console.log("🧷 Uploading rollback snapshot...");

  execSync(
    `CLOUDFLARE_API_TOKEN=${process.env.CLOUDFLARE_API_TOKEN} npx wrangler versions upload`,
    { stdio: "inherit" }
  );
}

// ----------------------
// RUN PIPELINE
// ----------------------
function run() {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    console.error("❌ Missing CLOUDFLARE_API_TOKEN");
    process.exit(1);
  }

  writeLedger();
  build();
  deploy();
  snapshot();

  console.log(`✅ Deploy complete: ${version}`);
}

run();