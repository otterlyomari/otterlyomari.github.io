export const prerender = false;

const ACCOUNT_ID = import.meta.env.CF_ACCOUNT_ID;

export async function POST({ request }) {
  const { deploymentId } = await request.json();

  if (!deploymentId) {
    return new Response('Missing deploymentId', { status: 400 });
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/workers/deployments/${deploymentId}/rollback`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
  });
}
