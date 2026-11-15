const pool = require('../config/db');
const { checkAdmin } = require('../utils/access');

// GET /api/institutions?q=ateneo      (anyone; feeds the "further education" dropdown)
exports.list = async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  try {
    const result = q
      ? await pool.query(
          'SELECT id, name, country FROM institutions WHERE name ILIKE $1 ORDER BY name LIMIT 100',
          [`%${q}%`]
        )
      : await pool.query('SELECT id, name, country FROM institutions ORDER BY name');
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/institutions   body: { requester_id, name, country? }   (admin only)
exports.create = async (req, res) => {
  const { requester_id, name, country } = req.body;

  if (typeof name !== 'string' || !name.trim() || name.trim().length > 200) {
    return res.status(400).json({ error: 'name is required (max 200 characters)' });
  }

  try {
    const access = await checkAdmin(requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      `INSERT INTO institutions (name, country) VALUES ($1, COALESCE($2, 'Philippines'))
       RETURNING id, name, country`,
      [name.trim(), typeof country === 'string' && country.trim() ? country.trim() : null]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'That institution is already in the list' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};