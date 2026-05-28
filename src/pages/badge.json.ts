export const prerender = false;

type Env = {
  CF_ACCOUNT_ID: string;
  CF_PROJECT_NAME: string;
  CF_API_TOKEN: string;
};

export async function GET({ env }: { env: Env }) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/pages/projects/${env.CF_PROJECT_NAME}`,
    {
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
      },
    }
  );

  const data = await res.json();

  const latest = data?.result?.latest_deployment;
  const status = latest?.latest_stage?.status;

  return new Response(
    JSON.stringify({
      schemaVersion: 1,
      label: "build",
      message:
        status === "success"
          ? "passing"
          : status === "failure"
          ? "failing"
          : "building",
      color:
        status === "success"
          ? "green"
          : status === "failure"
          ? "red"
          : "yellow",
    }),
    {
      headers: { "content-type": "application/json" },
    }
  );
}