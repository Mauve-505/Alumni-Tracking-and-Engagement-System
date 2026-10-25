const pool = require('../config/db');
const { checkProfileAccess } = require('../utils/access');

exports.list = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM education WHERE profile_id = $1 ORDER BY year DESC',
      [req.params.profileId]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.add = async (req, res) => {
  const { profileId } = req.params;
  const { requester_id, institution, degree, year } = req.body;

  if (!institution) {
    return res.status(400).json({ error: 'institution is required' });
  }
  if (year !== undefined && year !== null && !Number.isInteger(year)) {
    return res.status(400).json({ error: 'year must be a number' });
  }

  try {
    const access = await checkProfileAccess(profileId, requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      'INSERT INTO education (profile_id, institution, degree, year) VALUES ($1, $2, $3, $4) RETURNING *',
      [profileId, institution, degree || null, year || null]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { requester_id, institution, degree, year } = req.body;

  if (year !== undefined && year !== null && !Number.isInteger(year)) {
    return res.status(400).json({ error: 'year must be a number' });
  }

  try {
    const record = await pool.query('SELECT profile_id FROM education WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Education record not found' });
    }
    const access = await checkProfileAccess(record.rows[0].profile_id, requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      `UPDATE education SET
         institution = COALESCE($1, institution),
         degree = COALESCE($2, degree),
         year = COALESCE($3, year)
       WHERE id = $4 RETURNING *`,
      [institution, degree, year, id]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  const requester_id = req.query.requester_id;

  try {
    const record = await pool.query('SELECT profile_id FROM education WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Education record not found' });
    }
    const access = await checkProfileAccess(record.rows[0].profile_id, requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    await pool.query('DELETE FROM education WHERE id = $1', [id]);
    res.json({ data: { deleted: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};