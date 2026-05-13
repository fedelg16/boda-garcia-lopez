export default async function handler(req, res) {
  if ((req.headers['authorization'] || '') !== 'Bearer ' + process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY;
  const headers = {
    'apikey': SUPA_KEY,
    'Authorization': 'Bearer ' + SUPA_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };

  if (req.method === 'GET') {
    const r = await fetch(
      SUPA_URL + '/rest/v1/invitaciones?select=id,cabeza,miembros,cupos,codigo,confirmado,restricciones,cancion,mensaje_invitado,confirmed_at,created_at&order=created_at.desc',
      { headers }
    );
    return res.status(r.status).json(await r.json());
  }

  if (req.method === 'POST') {
    const r = await fetch(SUPA_URL + '/rest/v1/invitaciones', {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });
    return res.status(r.status).json(await r.json());
  }

  res.status(405).json({ error: 'Method not allowed' });
}
