const pool = require('../config/db');
const { checkAdmin } = require('../utils/access');

function validId(value) {
  const validType =
    (typeof value === 'number' && Number.isInteger(value)) ||
    (typeof value === 'string' && /^\d+$/.test(value));
  return validType && Number(value) > 0 && Number(value) <= 2147483647;
}

function sendError(res, err) {
  console.error(err);
  return res.status(500).json({ error: 'Server error' });
}

exports.listPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.author_id, p.title, p.content, p.type, p.published_at,
              u.email AS author_email
       FROM posts p
       JOIN users u ON u.id = p.author_id
       ORDER BY p.published_at DESC, p.id DESC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    sendError(res, err);
  }
};

exports.createPost = async (req, res) => {
  const { requester_id, title, content, type = 'news' } = req.body;
  if (typeof title !== 'string' || !title.trim() || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  if (!['news', 'update'].includes(type)) {
    return res.status(400).json({ error: "type must be 'news' or 'update'" });
  }

  try {
    const access = await checkAdmin(requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const result = await pool.query(
      `INSERT INTO posts (author_id, title, content, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [requester_id, title.trim(), content.trim(), type]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    sendError(res, err);
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { requester_id, title, content, type } = req.body;
  if (!validId(id)) return res.status(400).json({ error: 'Invalid post id' });
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'title cannot be empty' });
  }
  if (content !== undefined && (typeof content !== 'string' || !content.trim())) {
    return res.status(400).json({ error: 'content cannot be empty' });
  }
  if (type !== undefined && !['news', 'update'].includes(type)) {
    return res.status(400).json({ error: "type must be 'news' or 'update'" });
  }
  if (title === undefined && content === undefined && type === undefined) {
    return res.status(400).json({ error: 'At least one post field is required' });
  }

  try {
    const access = await checkAdmin(requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const result = await pool.query(
      `UPDATE posts SET
         title = COALESCE($1, title),
         content = COALESCE($2, content),
         type = COALESCE($3, type)
       WHERE id = $4 RETURNING *`,
      [title === undefined ? null : title.trim(), content === undefined ? null : content.trim(), type ?? null, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Post not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    sendError(res, err);
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return res.status(400).json({ error: 'Invalid post id' });
  try {
    const access = await checkAdmin(req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Post not found' });
    res.json({ data: { id: result.rows[0].id } });
  } catch (err) {
    sendError(res, err);
  }
};

exports.listEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.id, e.title, e.description, e.location, e.event_date,
              e.created_by, e.created_at,
              COUNT(r.id)::int AS rsvp_count
       FROM events e
       LEFT JOIN event_rsvps r ON r.event_id = e.id
       GROUP BY e.id
       ORDER BY e.event_date ASC, e.id ASC`
    );
    res.json({ data: result.rows });
  } catch (err) {
    sendError(res, err);
  }
};

exports.createEvent = async (req, res) => {
  const { requester_id, title, description, location, event_date } = req.body;
  if (typeof title !== 'string' || !title.trim() || !event_date || Number.isNaN(Date.parse(event_date))) {
    return res.status(400).json({ error: 'A title and valid event_date are required' });
  }
  if ([description, location].some((field) => field !== undefined && field !== null && typeof field !== 'string')) {
    return res.status(400).json({ error: 'description and location must be strings' });
  }

  try {
    const access = await checkAdmin(requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const result = await pool.query(
      `INSERT INTO events (title, description, location, event_date, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title.trim(), description ?? null, location ?? null, event_date, requester_id]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    sendError(res, err);
  }
};

exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { requester_id, title, description, location, event_date } = req.body;
  if (!validId(id)) return res.status(400).json({ error: 'Invalid event id' });
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ error: 'title cannot be empty' });
  }
  if (event_date !== undefined && Number.isNaN(Date.parse(event_date))) {
    return res.status(400).json({ error: 'event_date must be a valid date' });
  }
  if ([description, location].some((field) => field !== undefined && field !== null && typeof field !== 'string')) {
    return res.status(400).json({ error: 'description and location must be strings' });
  }
  if ([title, description, location, event_date].every((field) => field === undefined)) {
    return res.status(400).json({ error: 'At least one event field is required' });
  }

  try {
    const access = await checkAdmin(requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const result = await pool.query(
      `UPDATE events SET
         title = COALESCE($1, title),
         description = CASE WHEN $2 THEN $3 ELSE description END,
         location = CASE WHEN $4 THEN $5 ELSE location END,
         event_date = COALESCE($6, event_date)
       WHERE id = $7 RETURNING *`,
      [
        title === undefined ? null : title.trim(),
        description !== undefined,
        description ?? null,
        location !== undefined,
        location ?? null,
        event_date ?? null,
        id,
      ]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Event not found' });
    res.json({ data: result.rows[0] });
  } catch (err) {
    sendError(res, err);
  }
};

exports.deleteEvent = async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) return res.status(400).json({ error: 'Invalid event id' });
  try {
    const access = await checkAdmin(req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Event not found' });
    res.json({ data: { id: result.rows[0].id } });
  } catch (err) {
    sendError(res, err);
  }
};

exports.submitRsvp = async (req, res) => {
  const { id: eventId } = req.params;
  const { requester_id, response } = req.body;
  if (!validId(eventId)) return res.status(400).json({ error: 'Invalid event id' });
  if (!['going', 'maybe', 'declined'].includes(response)) {
    return res.status(400).json({ error: "response must be 'going', 'maybe', or 'declined'" });
  }
  if (!validId(requester_id)) return res.status(400).json({ error: 'requester_id is required' });

  try {
    const profile = await pool.query(
      `SELECT p.id FROM alumni_profiles p
       JOIN users u ON u.id = p.user_id
       WHERE u.id = $1 AND u.role = 'alumni'`,
      [requester_id]
    );
    if (!profile.rows.length) return res.status(404).json({ error: 'Alumni profile not found' });
    const event = await pool.query('SELECT id FROM events WHERE id = $1', [eventId]);
    if (!event.rows.length) return res.status(404).json({ error: 'Event not found' });
    const result = await pool.query(
      `INSERT INTO event_rsvps (event_id, profile_id, response)
       VALUES ($1, $2, $3)
       ON CONFLICT (event_id, profile_id)
       DO UPDATE SET response = EXCLUDED.response
       RETURNING *`,
      [eventId, profile.rows[0].id, response]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    sendError(res, err);
  }
};

exports.listRsvps = async (req, res) => {
  const eventId = req.params.id || req.query.event_id;
  if (eventId !== undefined && !validId(eventId)) {
    return res.status(400).json({ error: 'Invalid event id' });
  }
  try {
    const access = await checkAdmin(req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    if (eventId !== undefined) {
      const event = await pool.query('SELECT id FROM events WHERE id = $1', [eventId]);
      if (!event.rows.length) return res.status(404).json({ error: 'Event not found' });
    }
    const values = eventId === undefined ? [] : [eventId];
    const filter = eventId === undefined ? '' : 'WHERE e.id = $1';
    const result = await pool.query(
      `SELECT r.id, r.event_id, e.title AS event_title, e.event_date,
              r.profile_id, p.first_name, p.last_name, u.email, r.response
       FROM event_rsvps r
       JOIN events e ON e.id = r.event_id
       JOIN alumni_profiles p ON p.id = r.profile_id
       JOIN users u ON u.id = p.user_id
       ${filter}
       ORDER BY e.event_date ASC, p.last_name ASC, p.first_name ASC`,
      values
    );
    res.json({ data: result.rows });
  } catch (err) {
    sendError(res, err);
  }
};