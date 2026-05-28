export const prerender = false;

export async function GET(context: any) {
  try {
    const env = context?.locals?.runtime?.env;

    if (!env?.CF_API_TOKEN) {
      return Response.json({
        schemaVersion: 1,
        label: "build",
        message: "missing token",
        color: "red",
      });
    }

    const res = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/cce2e206b76dbfa476f08a9b3b32e343/pages/projects/otterlyomari-website",
      {
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      return Response.json({
        schemaVersion: 1,
        label: "build",
        message: `api ${res.status}`,
        color: "red",
      });
    }

    const data = await res.json();

    const status =
      data?.result?.latest_deployment?.latest_stage?.status;

    let message = "building";
    let color = "yellow";

    if (status === "success") {
      message = "passing";
      color = "green";
    } else if (
      status === "failure" ||
      status === "errored"
    ) {
      message = "failing";
      color = "red";
    }

    return Response.json({
      schemaVersion: 1,
      label: "build",
      message,
      color,
    });
  } catch (err: any) {
    return Response.json({
      schemaVersion: 1,
      label: "build",
      message: "server error",
      color: "red",
      error: String(err),
    });
  }
}