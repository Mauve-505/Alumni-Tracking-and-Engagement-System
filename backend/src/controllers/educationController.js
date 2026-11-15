const pool = require('../config/db');
const { checkProfileAccess } = require('../utils/access');

const LEVELS = ['certificate', 'diploma', 'bachelors', 'masters', 'doctorate', 'short_course'];

// If institution_id is given, use the name from the institutions table.
// Returns { ok, name, id } or { ok:false, error }.
async function resolveInstitution(institution_id, institution) {
  if (institution_id !== undefined && institution_id !== null) {
    if (!Number.isInteger(institution_id)) return { ok: false, error: 'institution_id must be a number' };
    const r = await pool.query('SELECT id, name FROM institutions WHERE id = $1', [institution_id]);
    if (r.rows.length === 0) return { ok: false, error: 'Unknown institution_id' };
    return { ok: true, id: r.rows[0].id, name: r.rows[0].name };
  }
  if (typeof institution === 'string' && institution.trim()) {
    return { ok: true, id: null, name: institution.trim() };
  }
  return { ok: true, id: null, name: null };
}

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
  const { requester_id, institution_id, institution, level, degree, year } = req.body;

  if (level !== undefined && level !== null && !LEVELS.includes(level)) {
    return res.status(400).json({ error: `level must be one of: ${LEVELS.join(', ')}` });
  }
  if (year !== undefined && year !== null && !Number.isInteger(year)) {
    return res.status(400).json({ error: 'year must be a number' });
  }

  try {
    const access = await checkProfileAccess(profileId, requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const inst = await resolveInstitution(institution_id, institution);
    if (!inst.ok) return res.status(400).json({ error: inst.error });
    if (!inst.name) {
      return res.status(400).json({ error: 'Choose an institution or type its name' });
    }

    const result = await pool.query(
      `INSERT INTO education (profile_id, institution_id, institution, level, degree, year)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [profileId, inst.id, inst.name, level || null, degree || null, year || null]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { requester_id, institution_id, institution, level, degree, year } = req.body;

  if (year !== undefined && year !== null && !Number.isInteger(year)) {
    return res.status(400).json({ error: 'year must be a number' });
  }
  if (level !== undefined && level !== null && !LEVELS.includes(level)) {
    return res.status(400).json({ error: `level must be one of: ${LEVELS.join(', ')}` });
  }

  try {
    const record = await pool.query('SELECT profile_id FROM education WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Education record not found' });
    }
    const access = await checkProfileAccess(record.rows[0].profile_id, requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const inst = await resolveInstitution(institution_id, institution);
    if (!inst.ok) return res.status(400).json({ error: inst.error });

    const result = await pool.query(
      `UPDATE education SET
         institution_id = CASE WHEN $1::boolean THEN $2 ELSE institution_id END,
         institution = COALESCE($3, institution),
         level = COALESCE($4, level),
         degree = COALESCE($5, degree),
         year = COALESCE($6, year)
       WHERE id = $7 RETURNING *`,
      [inst.name !== null, inst.id, inst.name, level, degree, year, id]
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