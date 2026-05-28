export const prerender = false;

export async function GET() {
  try {
    const res = await fetch("/deploy-ledger.json");
    const ledger = await res.json();

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
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        schemaVersion: 1,
        label: "deploy",
        message: "unknown",
        color: "yellow",
      }),
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
}