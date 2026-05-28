export const prerender = false;

export async function GET({ env }) {
  const res = await fetch(
    "https://api.cloudflare.com/client/v4/accounts/cce2e206b76dbfa476f08a9b3b32e343/pages/projects/otterlyomari-website",
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
      headers: {
        "content-type": "application/json",
      },
    }
  );
}