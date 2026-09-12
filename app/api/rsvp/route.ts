import { saveRsvp } from '@/db/raw';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return Response.json({error:'Origin rejected'}, {status:403});
  if (!request.headers.get('content-type')?.includes('application/json')) return Response.json({error:'JSON required'}, {status:415});
  if (Number(request.headers.get('content-length')) > 8192) return Response.json({error:'Too large'}, {status:413});
  let data;
  try {
    const text = await request.text();
    if (text.length > 8192) return Response.json({error:'Too large'}, {status:413});
    data = JSON.parse(text);
  } catch { return Response.json({error:'Invalid JSON'}, {status:400}); }
  if (!data || typeof data !== 'object' || typeof data.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(data.id) ||
      typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.length > 100 ||
      !['yes','no'].includes(data.attendance) || typeof data.message !== 'string' || data.message.length > 1000 || data.website) {
    return Response.json({error:'Invalid response'}, {status:400});
  }
  try {
    await saveRsvp(data);
    return Response.json({saved:true}, {headers:{'Cache-Control':'no-store'}});
  } catch { return Response.json({error:'Please retry'}, {status:503}); }
}
