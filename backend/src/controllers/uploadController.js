const fs = require('fs');
const pool = require('../config/db');
const { checkProfileAccess, checkAdmin } = require('../utils/access');
const { saveFile, resolveUpload, deleteUpload } = require('../utils/files');

const IMAGE_TYPES = ['jpg', 'png', 'webp'];
const DOCUMENT_TYPES = ['jpg', 'png', 'webp', 'pdf'];

// POST /api/alumni/:id/photo?requester_id=1     (body = the image file)
exports.profilePhoto = async (req, res) => {
  const { id } = req.params;
  try {
    const access = await checkProfileAccess(id, req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const saved = saveFile('photos', req.body, IMAGE_TYPES);
    if (!saved.ok) return res.status(400).json({ error: saved.error });

    const old = await pool.query('SELECT photo_url FROM alumni_profiles WHERE id = $1', [id]);
    const photoUrl = `/uploads/${saved.relPath}`;
    await pool.query(
      'UPDATE alumni_profiles SET photo_url = $1, updated_at = NOW() WHERE id = $2',
      [photoUrl, id]
    );

    const oldUrl = old.rows[0]?.photo_url;
    if (oldUrl && oldUrl.startsWith('/uploads/photos/')) deleteUpload(oldUrl.replace('/uploads/', ''));

    res.json({ data: { photo_url: photoUrl } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/alumni/:id/certificate?requester_id=1     (body = image or PDF)
// Private: only the owner and admins can view it again (see viewCertificate).
exports.certificate = async (req, res) => {
  const { id } = req.params;
  try {
    const access = await checkProfileAccess(id, req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const saved = saveFile('certificates', req.body, DOCUMENT_TYPES);
    if (!saved.ok) return res.status(400).json({ error: saved.error });

    const old = await pool.query('SELECT certificate_url FROM alumni_profiles WHERE id = $1', [id]);

    // Uploading a new certificate after a rejection sends the profile back to "pending"
    await pool.query(
      `UPDATE alumni_profiles SET
         certificate_url = $1,
         status = CASE WHEN status = 'rejected' THEN 'pending' ELSE status END,
         rejection_reason = CASE WHEN status = 'rejected' THEN NULL ELSE rejection_reason END,
         updated_at = NOW()
       WHERE id = $2`,
      [saved.relPath, id]
    );

    if (old.rows[0]?.certificate_url) deleteUpload(old.rows[0].certificate_url);

    res.status(201).json({ data: { has_certificate: true } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/alumni/:id/certificate?requester_id=1     (owner or admin only)
exports.viewCertificate = async (req, res) => {
  const { id } = req.params;
  try {
    const access = await checkProfileAccess(id, req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const result = await pool.query('SELECT certificate_url FROM alumni_profiles WHERE id = $1', [id]);
    const rel = result.rows[0]?.certificate_url;
    const full = rel && resolveUpload(rel);
    if (!full || !fs.existsSync(full)) {
      return res.status(404).json({ error: 'No certificate uploaded' });
    }

    const ext = full.split('.').pop();
    const mime = { pdf: 'application/pdf', png: 'image/png', webp: 'image/webp' }[ext] || 'image/jpeg';
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    fs.createReadStream(full).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/uploads/image?requester_id=1     (admin only; for post and event images)
exports.adminImage = async (req, res) => {
  try {
    const access = await checkAdmin(req.query.requester_id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });

    const saved = saveFile('images', req.body, IMAGE_TYPES);
    if (!saved.ok) return res.status(400).json({ error: saved.error });

    res.status(201).json({ data: { url: `/uploads/${saved.relPath}` } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};