export const prerender = false;

import { execSync } from "child_process";

export async function GET({ url }) {
  const tag = url.searchParams.get("tag");

  // list tags
  const tags = execSync("git tag", { encoding: "utf-8" })
    .split("\n")
    .filter(Boolean)
    .slice(-20)
    .reverse();

  // if no tag requested → return available options
  if (!tag) {
    return new Response(
      JSON.stringify({
        available: tags,
        usage: "/rollback.json?tag=v3.2.0",
      }),
      { headers: { "content-type": "application/json" } }
    );
  }

  // validate tag
  if (!tags.includes(tag)) {
    return new Response(
      JSON.stringify({
        error: "Invalid tag",
        available: tags,
      }),
      { headers: { "content-type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      message: `Rollback target: ${tag} is valid (deploy via CLI or CI)`,
      tag,
    }),
    { headers: { "content-type": "application/json" } }
  );
}