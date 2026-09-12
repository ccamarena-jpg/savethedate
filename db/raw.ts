import { neon } from '@neondatabase/serverless';
export async function saveRsvp(data: {id:string;name:string;attendance:string;message:string}) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured');
  const sql = neon(url);
  await sql`INSERT INTO rsvps (id, name, attendance, message, created_at)
    VALUES (${data.id}, ${data.name.trim()}, ${data.attendance}, ${data.message.trim()}, ${new Date().toISOString()})
    ON CONFLICT (id) DO NOTHING`;
}
