export const prerender = false;

const ACCOUNT_ID = import.meta.env.CF_ACCOUNT_ID;
const WORKER = import.meta.env.CF_WORKER_NAME;

export async function GET() {
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/deployments?name=${WORKER}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.CF_API_TOKEN}`,
        },
      }
    );

    const json = await res.json();

    const deployments = json?.result ?? [];

    const latest = deployments[0];

    const version =
      latest?.versions?.[0]?.tag ||
      latest?.deployment_id?.slice(0, 7) ||
      "unknown";

    return new Response(
      JSON.stringify({
        schemaVersion: 1,
        label: "deploy",
        message: version,
        color: "green",
      }),
      {
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        schemaVersion: 1,
        label: "deploy",
        message: "offline",
        color: "red",
      }),
      {
        headers: { "content-type": "application/json" },
      }
    );
  }
}