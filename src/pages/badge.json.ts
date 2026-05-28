import fs from "fs";

const ledger = JSON.parse(
  fs.readFileSync("public/deploy-ledger.json", "utf-8")
);

export const prerender = false;

export async function GET() {
  const latest = ledger?.[0]?.version ?? "unknown";

  return new Response(
    JSON.stringify({
      schemaVersion: 1,
      label: "deploy",
      message: latest,
      color: "green",
    }),
    {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    }
  );
}