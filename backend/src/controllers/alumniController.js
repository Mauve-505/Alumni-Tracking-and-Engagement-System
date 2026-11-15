const pool = require('../config/db');
const { checkProfileAccess, checkAdmin } = require('../utils/access');

const EMPLOYMENT_STATUSES = ['employed', 'self_employed', 'unemployed', 'further_study'];
const STATUSES = ['pending', 'verified', 'rejected'];

// GET /api/alumni?name=&year=&program=&college=&employment_status=
// Public directory: verified alumni only.
// Admins can see everyone (or filter by status) by adding requester_id and status.
exports.getAlumni = async (req, res) => {
  const { name, year, program, college, employment_status, status, requester_id } = req.query;

  const conditions = [];
  const values = [];

  if (year !== undefined && year !== '') {
    if (!/^\d{4}$/.test(String(year))) {
      return res.status(400).json({ error: 'year must be a 4-digit number' });
    }
  }
  if (employment_status && !EMPLOYMENT_STATUSES.includes(employment_status)) {
    return res.status(400).json({ error: `employment_status must be one of: ${EMPLOYMENT_STATUSES.join(', ')}` });
  }
  if (status && !STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
  }

  try {
    // Only an admin may see non-verified profiles
    // A requester_id that is not an admin is simply ignored (they get the public list)
    let isAdmin = false;
    if (requester_id !== undefined) {
      const access = await checkAdmin(requester_id);
      isAdmin = access.ok;
    }

    if (isAdmin) {
      if (status) {
        values.push(status);
        conditions.push(`p.status = $${values.length}`);
      }
    } else {
      conditions.push(`p.status = 'verified'`);
    }

    if (name) {
      values.push(`%${name}%`);
      conditions.push(`(p.first_name ILIKE $${values.length} OR p.last_name ILIKE $${values.length})`);
    }
    if (year) {
      values.push(Number(year));
      conditions.push(`p.graduation_year = $${values.length}`);
    }
    if (program) {
      values.push(`%${program}%`);
      conditions.push(`p.program ILIKE $${values.length}`);
    }
    if (college) {
      values.push(`%${college}%`);
      conditions.push(`p.college ILIKE $${values.length}`);
    }
    if (employment_status) {
      values.push(employment_status);
      conditions.push(`p.employment_status = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT p.id, p.user_id, p.first_name, p.last_name, p.graduation_year,
              p.program, p.college, p.employment_status, p.photo_url, p.status,
              (SELECT e.company FROM employment_history e
                WHERE e.profile_id = p.id AND e.is_current = TRUE LIMIT 1) AS current_company,
              (SELECT e.position FROM employment_history e
                WHERE e.profile_id = p.id AND e.is_current = TRUE LIMIT 1) AS current_position
       FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       ${where ? where + " AND u.role = 'alumni'" : "WHERE u.role = 'alumni'"}
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
              p.graduation_year, p.program, p.college, p.employment_status,
              p.phone, p.address, p.bio, p.photo_url, p.status,
              p.rejection_reason, (p.certificate_url IS NOT NULL) AS has_certificate,
              p.created_at
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
      'SELECT * FROM education WHERE profile_id = $1 ORDER BY year DESC NULLS LAST',
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
    program, college, employment_status, phone, address, bio, photo_url,
  } = req.body;

  if (
    graduation_year !== undefined &&
    graduation_year !== null &&
    !Number.isInteger(graduation_year)
  ) {
    return res.status(400).json({ error: 'graduation_year must be a number' });
  }

  if (employment_status !== undefined && employment_status !== null &&
      !EMPLOYMENT_STATUSES.includes(employment_status)) {
    return res.status(400).json({ error: `employment_status must be one of: ${EMPLOYMENT_STATUSES.join(', ')}` });
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
         college = COALESCE($5, college),
         employment_status = COALESCE($6, employment_status),
         phone = COALESCE($7, phone),
         address = COALESCE($8, address),
         bio = COALESCE($9, bio),
         photo_url = COALESCE($10, photo_url),
         updated_at = NOW()
       WHERE id = $11
       RETURNING id, user_id, first_name, last_name, graduation_year, program, college,
                 employment_status, phone, address, bio, photo_url, status, updated_at`,
      [first_name, last_name, graduation_year, program, college, employment_status,
       phone, address, bio, photo_url, id]
    );

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};