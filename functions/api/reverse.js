export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const lat = url.searchParams.get('lat');
  const lon = url.searchParams.get('lon');

  if (!lat ||!lon) {
    return new Response(JSON.stringify({ error: 'lat dan lon wajib' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const apiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}