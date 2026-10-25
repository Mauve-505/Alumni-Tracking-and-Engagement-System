const bcrypt = require('bcrypt');
const pool = require('../config/db');

exports.register = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password ||
    typeof first_name !== 'string' || !first_name.trim() ||
    typeof last_name !== 'string' || !last_name.trim()
  ) {
    return res.status(400).json({ error: 'Please fill in all fields' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (exists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
      [normalizedEmail, hash]
    );
    const user = userResult.rows[0];

    const profileResult = await client.query(
      `INSERT INTO alumni_profiles (user_id, first_name, last_name)
       VALUES ($1, $2, $3) RETURNING id`,
      [user.id, first_name.trim(), last_name.trim()]
    );

    await client.query('COMMIT');
    res.status(201).json({ data: { ...user, profile_id: profileResult.rows[0].id } });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client?.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      `SELECT u.*, p.id AS profile_id
       FROM users u
       LEFT JOIN alumni_profiles p ON p.user_id = u.id
       WHERE u.email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      data: { id: user.id, email: user.email, role: user.role, profile_id: user.profile_id },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};