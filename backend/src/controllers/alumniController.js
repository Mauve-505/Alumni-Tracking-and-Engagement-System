const pool = require('../config/db');
const { checkProfileAccess } = require('../utils/access');

exports.getAlumni = async (req, res) => {
  const { name, year, program, status } = req.query;

  const conditions = [];
  const values = [];

  if (name) {
    values.push(`%${name}%`);
    conditions.push(`(p.first_name ILIKE $${values.length} OR p.last_name ILIKE $${values.length})`);
  }
  if (year) {
    values.push(year);
    conditions.push(`p.graduation_year = $${values.length}`);
  }
  if (program) {
    values.push(`%${program}%`);
    conditions.push(`p.program ILIKE $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`p.status = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const result = await pool.query(
      `SELECT p.id, p.user_id, p.first_name, p.last_name, p.graduation_year,
              p.program, p.photo_url, p.status,
              (SELECT e.company FROM employment_history e
                WHERE e.profile_id = p.id AND e.is_current = TRUE LIMIT 1) AS current_company,
              (SELECT e.position FROM employment_history e
                WHERE e.profile_id = p.id AND e.is_current = TRUE LIMIT 1) AS current_position
       FROM alumni_profiles p
       ${where}
       ORDER BY p.last_name, p.first_name`,
      values
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/alumni/:id  (one profile with employment and education)
exports.getAlumniById = async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await pool.query(
      `SELECT p.id, p.user_id, u.email, p.first_name, p.last_name,
              p.graduation_year, p.program, p.phone, p.address,
              p.bio, p.photo_url, p.status, p.created_at
       FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );
    if (profile.rows.length === 0) {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }

    const employment = await pool.query(
      'SELECT * FROM employment_history WHERE profile_id = $1 ORDER BY is_current DESC, start_date DESC',
      [id]
    );
    const education = await pool.query(
      'SELECT * FROM education WHERE profile_id = $1 ORDER BY year DESC',
      [id]
    );

    res.json({
      data: {
        ...profile.rows[0],
        employment: employment.rows,
        education: education.rows,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/alumni/:id  (owner or admin only)
exports.updateAlumni = async (req, res) => {
  const { id } = req.params;
  const {
    requester_id, first_name, last_name, graduation_year,
    program, phone, address, bio, photo_url,
  } = req.body;

  if (
    graduation_year !== undefined &&
    graduation_year !== null &&
    !Number.isInteger(graduation_year)
  ) {
    return res.status(400).json({ error: 'graduation_year must be a number' });
  }

  try {
    const access = await checkProfileAccess(id, requester_id);
    if (!access.ok) {
      return res.status(access.status).json({ error: access.error });
    }

    const result = await pool.query(
      `UPDATE alumni_profiles SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         graduation_year = COALESCE($3, graduation_year),
         program = COALESCE($4, program),
         phone = COALESCE($5, phone),
         address = COALESCE($6, address),
         bio = COALESCE($7, bio),
         photo_url = COALESCE($8, photo_url),
         updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [first_name, last_name, graduation_year, program, phone, address, bio, photo_url, id]
    );

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};