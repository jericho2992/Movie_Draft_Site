export async function handler(event) {
  const runId = event.queryStringParameters?.runId;
  if (!runId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing runId' }) };
  }

  const api_token = process.env.APIFY_KEY;
  const res = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}?token=${api_token}`
  );
  const data = await res.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: data.data.status,
      datasetId: data.data.defaultDatasetId
    })
  };
}