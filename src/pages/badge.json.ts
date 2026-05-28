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

  let message = "unknown";
  let color = "lightgrey";

  if (status === "success") {
    message = "passing";
    color = "green";
  } else if (status === "failure" || status === "errored") {
    message = "failing";
    color = "red";
  } else if (status) {
    message = "building";
    color = "yellow";
  }

  return new Response(
    JSON.stringify({
      schemaVersion: 1,
      label: "build",
      message,
      color,
    }),
    {
      headers: {
        "content-type": "application/json",
        "Cache-Control": "no-store",
      },
    }
  );
}