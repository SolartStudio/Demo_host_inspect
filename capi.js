export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { event_name, event_id } = req.body || {};

  const payload = {
    data: [{
      event_name: event_name || 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      action_source: 'website',
      event_source_url: req.headers.referer || ''
    }]
  };

  const r = await fetch(
    `https://graph.facebook.com/v20.0/4637383239875785/events?access_token=${process.env.FB_CAPI_TOKEN}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
  );
  const data = await r.json();
  res.status(200).json(data);
}
