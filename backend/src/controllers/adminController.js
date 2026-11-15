const pool = require('../config/db');
const { checkAdmin } = require('../utils/access');
const { logAction } = require('../utils/audit');

exports.getPending = async (req, res) => {
  try {
    const access = await checkAdmin(req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      `SELECT p.id, p.user_id, u.email, p.first_name, p.last_name,
              p.graduation_year, p.program, p.college, p.employment_status,
              (p.certificate_url IS NOT NULL) AS has_certificate, p.status, p.created_at
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

// PATCH /api/alumni/:id/status   body: { requester_id, status, reason? }
// status: verified | pending | rejected   (a reason is required when rejecting)
exports.setStatus = async (req, res) => {
  const { id } = req.params;
  const { requester_id, status, reason } = req.body;

  if (!['verified', 'pending', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "status must be 'verified', 'pending' or 'rejected'" });
  }
  const cleanReason = typeof reason === 'string' ? reason.trim() : '';
  if (status === 'rejected' && !cleanReason) {
    return res.status(400).json({ error: 'A reason is required when rejecting' });
  }
  if (cleanReason.length > 500) {
    return res.status(400).json({ error: 'reason is too long (max 500 characters)' });
  }

  try {
    const access = await checkAdmin(requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      `UPDATE alumni_profiles SET
         status = $1,
         rejection_reason = $2,
         reviewed_by = $3,
         reviewed_at = NOW(),
         updated_at = NOW()
       WHERE id = $4
       RETURNING id, first_name, last_name, status, rejection_reason, reviewed_by, reviewed_at`,
      [status, status === 'rejected' ? cleanReason : null, Number(requester_id), id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alumni profile not found' });
    }

    await logAction(Number(requester_id), `profile_${status}`, 'alumni_profile', Number(id),
      status === 'rejected' ? { reason: cleanReason } : null);

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/admin/verify-bulk   body: { requester_id, ids: [1,2,3] }
// Verifies every listed profile that is currently pending.
exports.bulkVerify = async (req, res) => {
  const { requester_id, ids } = req.body;

  if (
    !Array.isArray(ids) || ids.length === 0 || ids.length > 200 ||
    !ids.every((n) => Number.isInteger(n) && n > 0 && n <= 2147483647)
  ) {
    return res.status(400).json({ error: 'ids must be a list of 1 to 200 profile ids' });
  }

  try {
    const access = await checkAdmin(requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      `UPDATE alumni_profiles SET
         status = 'verified', rejection_reason = NULL,
         reviewed_by = $1, reviewed_at = NOW(), updated_at = NOW()
       WHERE id = ANY($2::int[]) AND status = 'pending'
       RETURNING id`,
      [Number(requester_id), ids]
    );
    const verifiedIds = result.rows.map((r) => r.id);

    if (verifiedIds.length > 0) {
      await logAction(Number(requester_id), 'bulk_verify', 'alumni_profile', null, { ids: verifiedIds });
    }

    res.json({ data: { verified: verifiedIds.length, ids: verifiedIds, skipped: ids.length - verifiedIds.length } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/admin/audit-log?requester_id=1&limit=50
exports.getAuditLog = async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
  try {
    const access = await checkAdmin(req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query(
      `SELECT l.id, l.actor_id, u.email AS actor_email, l.action, l.target_type,
              l.target_id, l.details, l.created_at
       FROM audit_log l
       LEFT JOIN users u ON u.id = l.actor_id
       ORDER BY l.created_at DESC, l.id DESC
       LIMIT $1`,
      [limit]
    );
    res.json({ data: result.rows });
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
              COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
              COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
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

    const byCollege = await pool.query(
      `SELECT COALESCE(NULLIF(p.college, ''), 'Not specified') AS college, COUNT(*)::int AS count
       FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE u.role = 'alumni'
       GROUP BY 1
       ORDER BY count DESC, college`
    );

    const byEmployment = await pool.query(
      `SELECT COALESCE(p.employment_status, 'not_specified') AS employment_status, COUNT(*)::int AS count
       FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE u.role = 'alumni'
       GROUP BY 1
       ORDER BY count DESC`
    );

    const events = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE event_date >= NOW())::int AS upcoming FROM events`
    );
    const posts = await pool.query('SELECT COUNT(*)::int AS total FROM posts');

    const { total, verified, pending, rejected } = counts.rows[0];
    const employmentRate = total === 0 ? 0 : Math.round((employed.rows[0].employed / total) * 100);

    res.json({
      data: {
        total_alumni: total,
        verified,
        pending,
        rejected,
        employment_rate: employmentRate,
        recent_signups: recent.rows,
        alumni_per_year: perYear.rows,
        by_college: byCollege.rows,
        by_employment_status: byEmployment.rows,
        upcoming_events: events.rows[0].upcoming,
        total_posts: posts.rows[0].total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};