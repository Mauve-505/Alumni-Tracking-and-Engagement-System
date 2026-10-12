const pool = require('../config/db');

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