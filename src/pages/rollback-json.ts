export const prerender = false;

export async function GET() {
  const res = await fetch("/deploy-ledger.json");
  const ledger = await res.json();

  return new Response(
    JSON.stringify({
      latest: ledger[0],
      history: ledger.slice(0, 5),
    }),
    {
      headers: {
        "content-type": "application/json",
      },
    }
  );
}