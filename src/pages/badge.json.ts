export const prerender = false;

import pkg from "../../package.json";

export async function GET({ request }) {
  const commit =
    import.meta.env?.COMMIT_SHA ||
    "unknown";

  const version = pkg.version;

  const status = "success";

  return new Response(
    JSON.stringify({
      schemaVersion: 1,
      label: "deploy",
      message: `${version}+${commit.slice(0, 7)}`,
      color: "green",
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
}