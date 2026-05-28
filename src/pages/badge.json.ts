export const prerender = false;

export async function GET() {
  return Response.json({
    schemaVersion: 1,
    label: "build",
    message: "passing",
    color: "green",
  });
}