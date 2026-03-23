import { neon } from '@netlify/neon';

const sql = neon();

export default async (req) => {
  try {
    const url = new URL(req.url);
    const serviceKey = url.searchParams.get('serviceKey') || 'rogue-2015-graziella';

    await sql`
      CREATE TABLE IF NOT EXISTS service_records (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        service_key TEXT NOT NULL UNIQUE,
        service_data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    const rows = await sql`
      SELECT service_data FROM service_records
      WHERE service_key = ${serviceKey}
      LIMIT 1
    `;

    if (!rows.length) {
      return new Response(JSON.stringify({ ok: false, data: null }), { status: 404 });
    }

    return new Response(JSON.stringify({ ok: true, data: rows[0].service_data }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }
};
