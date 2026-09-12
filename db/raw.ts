export async function saveRsvp(data: {id:string;name:string;attendance:string;message:string}) {
  const url = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.RSVP_SHEETS_SECRET;
  if (!url || !secret) throw new Error('Google Sheets is not configured');
  const target = new URL(url);
  if (target.protocol !== 'https:' || target.hostname !== 'script.google.com' || !target.pathname.endsWith('/exec')) throw new Error('Invalid Apps Script URL');
  const response = await fetch(url, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({secret,...data}), cache:'no-store',
    signal:AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('Sheets request failed');
  const result = await response.json();
  if (result.saved !== true) throw new Error('Sheets did not confirm saving');
}
