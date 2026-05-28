export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/badge.json") {
      return new Response("Not found", { status: 404 });
    }

    try {
      if (!env?.CF_API_TOKEN) {
        return json("no env", "lightgrey");
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
        return json("api error", "red");
      }

      const data = await res.json();

      const latest = data?.result?.latest_deployment;
      const status = latest?.latest_stage?.status;

      if (status === "success") return json("passing", "green");
      if (status === "failure") return json("failing", "red");

      return json("building", "yellow");
    } catch (e) {
      return json("error", "red");
    }

    function json(message, color) {
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
    }
  },
};