export default {
  async fetch(request, env) {
    try {
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

      let message = "building";
      let color = "yellow";

      if (status === "success") {
        message = "passing";
        color = "green";
      } else if (status === "failure") {
        message = "failing";
        color = "red";
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
          },
        }
      );
    } catch (e) {
      return new Response(
        JSON.stringify({
          schemaVersion: 1,
          label: "build",
          message: "error",
          color: "red",
        }),
        {
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }
  },
};