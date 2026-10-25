const pool = require('../config/db');
const { checkProfileAccess } = require('../utils/access');

exports.list = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM employment_history WHERE profile_id = $1 ORDER BY is_current DESC, start_date DESC',
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
  const { requester_id, company, position, industry, start_date, end_date, is_current } = req.body;

  if (!company || !position) {
    return res.status(400).json({ error: 'company and position are required' });
  }

  try {
    const access = await checkProfileAccess(profileId, requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const current = !!is_current;
    const result = await pool.query(
      `INSERT INTO employment_history
         (profile_id, company, position, industry, start_date, end_date, is_current)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [profileId, company, position, industry || null, start_date || null, current ? null : end_date || null, current]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { requester_id, company, position, industry, start_date, end_date, is_current } = req.body;

  try {
    const record = await pool.query('SELECT profile_id FROM employment_history WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Employment record not found' });
    }
    const access = await checkProfileAccess(record.rows[0].profile_id, requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      `UPDATE employment_history SET
         company = COALESCE($1, company),
         position = COALESCE($2, position),
         industry = COALESCE($3, industry),
         start_date = COALESCE($4, start_date),
         end_date = CASE WHEN $6 IS TRUE THEN NULL ELSE COALESCE($5, end_date) END,
         is_current = COALESCE($6, is_current)
       WHERE id = $7 RETURNING *`,
      [company, position, industry, start_date, end_date, is_current, id]
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
    const record = await pool.query('SELECT profile_id FROM employment_history WHERE id = $1', [id]);
    if (record.rows.length === 0) {
      return res.status(404).json({ error: 'Employment record not found' });
    }
    const access = await checkProfileAccess(record.rows[0].profile_id, requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    await pool.query('DELETE FROM employment_history WHERE id = $1', [id]);
    res.json({ data: { deleted: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};