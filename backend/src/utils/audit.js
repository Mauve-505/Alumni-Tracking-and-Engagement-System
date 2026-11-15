const pool = require('../config/db');

// Writes one row to audit_log. Never throws: a logging problem must not break the real action.
async function logAction(actorId, action, targetType, targetId, details) {
  try {
    await pool.query(
      `INSERT INTO audit_log (actor_id, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5)`,
      [actorId, action, targetType, targetId, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('audit log failed:', err.message);
  }
}

module.exports = { logAction };