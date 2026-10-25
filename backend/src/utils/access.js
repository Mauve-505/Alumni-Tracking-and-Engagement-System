const pool = require('../config/db');

async function checkProfileAccess(profileId, requesterId) {
  if (!requesterId) {
    return { ok: false, status: 400, error: 'requester_id is required' };
  }
  const profile = await pool.query('SELECT user_id FROM alumni_profiles WHERE id = $1', [profileId]);
  if (profile.rows.length === 0) {
    return { ok: false, status: 404, error: 'Alumni profile not found' };
  }
  const user = await pool.query('SELECT id, role FROM users WHERE id = $1', [requesterId]);
  if (user.rows.length === 0) {
    return { ok: false, status: 401, error: 'Unknown user' };
  }
  const isOwner = profile.rows[0].user_id === user.rows[0].id;
  const isAdmin = user.rows[0].role === 'admin';
  if (!isOwner && !isAdmin) {
    return { ok: false, status: 403, error: 'You can only edit your own profile' };
  }
  return { ok: true };
}

async function checkAdmin(requesterId) {
  if (!requesterId) {
    return { ok: false, status: 400, error: 'requester_id is required' };
  }
  const user = await pool.query('SELECT role FROM users WHERE id = $1', [requesterId]);
  if (user.rows.length === 0) {
    return { ok: false, status: 401, error: 'Unknown user' };
  }
  if (user.rows[0].role !== 'admin') {
    return { ok: false, status: 403, error: 'Admin access only' };
  }
  return { ok: true };
}

module.exports = { checkProfileAccess, checkAdmin };