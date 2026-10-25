const pool = require('../config/db');
const { checkAdmin } = require('../utils/access');

exports.getPending = async (req, res) => {
  try {
    const access = await checkAdmin(req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      `SELECT p.id, p.user_id, u.email, p.first_name, p.last_name,
              p.graduation_year, p.program, p.status, p.created_at
       FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.status = 'pending' AND u.role = 'alumni'
       ORDER BY p.created_at DESC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.setStatus = async (req, res) => {
  const { id } = req.params;
  const { requester_id, status } = req.body;

  if (!['verified', 'pending'].includes(status)) {
    return res.status(400).json({ error: "status must be 'verified' or 'pending'" });
  }

  try {
    const access = await checkAdmin(requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      'UPDATE alumni_profiles SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const access = await checkAdmin(req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const counts = await pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'verified')::int AS verified,
              COUNT(*) FILTER (WHERE status = 'pending')::int AS pending
       FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE u.role = 'alumni'`
    );

    const employed = await pool.query(
      `SELECT COUNT(DISTINCT profile_id)::int AS employed
       FROM employment_history WHERE is_current = TRUE`
    );

    const recent = await pool.query(
      `SELECT p.id, p.first_name, p.last_name, p.program, p.graduation_year, p.status, p.created_at
       FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE u.role = 'alumni'
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    const perYear = await pool.query(
      `SELECT p.graduation_year AS year, COUNT(*)::int AS count
       FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.graduation_year IS NOT NULL AND u.role = 'alumni'
       GROUP BY p.graduation_year
       ORDER BY p.graduation_year`
    );

    const events = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE event_date >= NOW())::int AS upcoming FROM events`
    );
    const posts = await pool.query('SELECT COUNT(*)::int AS total FROM posts');

    const { total, verified, pending } = counts.rows[0];
    const employmentRate = total === 0 ? 0 : Math.round((employed.rows[0].employed / total) * 100);

    res.json({
      data: {
        total_alumni: total,
        verified,
        pending,
        employment_rate: employmentRate,
        recent_signups: recent.rows,
        alumni_per_year: perYear.rows,
        upcoming_events: events.rows[0].upcoming,
        total_posts: posts.rows[0].total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};