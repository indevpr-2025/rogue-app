import { neon } from '@netlify/neon';

const sql = neon();

export default async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ ok: false }), { status: 405 });
    }

    const body = await req.json();
    const serviceKey = body.serviceKey;
    const data = body.data;

    await sql`
      CREATE TABLE IF NOT EXISTS service_records (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        service_key TEXT NOT NULL UNIQUE,
        service_data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO service_records (service_key, service_data)
      VALUES (${serviceKey}, ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (service_key)
      DO UPDATE SET service_data = EXCLUDED.service_data, updated_at = NOW()
    `;

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }
};
