import fs from "fs";
import path from "path";

const ledgerPath = path.resolve("public/deploy-ledger.json");

export function appendDeploy(entry: any) {
  let ledger = [];

  if (fs.existsSync(ledgerPath)) {
    ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf-8"));
  }

  ledger.unshift(entry);

  // keep last 20 deploys
  ledger = ledger.slice(0, 20);

  fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
}