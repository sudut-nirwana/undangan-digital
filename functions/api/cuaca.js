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

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,weather_code&timezone=auto`;

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