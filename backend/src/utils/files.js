const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// All uploads live in backend/uploads/<kind>/
const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

const TYPES = {
  jpg: { ext: 'jpg', mime: 'image/jpeg' },
  png: { ext: 'png', mime: 'image/png' },
  webp: { ext: 'webp', mime: 'image/webp' },
  pdf: { ext: 'pdf', mime: 'application/pdf' },
};

// Look at the first bytes of the file to see what it really is
// (we do not trust the filename or the Content-Type header)
function detectType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return TYPES.jpg;
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return TYPES.png;
  if (buf.length >= 12 && buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') return TYPES.webp;
  if (buf.length >= 5 && buf.subarray(0, 5).toString() === '%PDF-') return TYPES.pdf;
  return null;
}

// Save a file under uploads/<kind>/ with a random name.
// allowed = list of keys of TYPES, e.g. ['jpg', 'png', 'webp'].
function saveFile(kind, buffer, allowed) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { ok: false, error: 'No file received. Send the file as the request body.' };
  }
  const type = detectType(buffer);
  if (!type || !allowed.includes(type.ext)) {
    return { ok: false, error: `Unsupported file type. Allowed: ${allowed.join(', ')}.` };
  }
  const dir = path.join(UPLOAD_ROOT, kind);
  fs.mkdirSync(dir, { recursive: true });
  const name = `${crypto.randomBytes(12).toString('hex')}.${type.ext}`;
  fs.writeFileSync(path.join(dir, name), buffer);
  return { ok: true, name, relPath: `${kind}/${name}`, mime: type.mime };
}

// Resolve "kind/name" to a real path, only if it stays inside the uploads folder
function resolveUpload(relPath) {
  if (typeof relPath !== 'string') return null;
  const full = path.resolve(UPLOAD_ROOT, relPath);
  if (!full.startsWith(UPLOAD_ROOT + path.sep)) return null;
  return full;
}

function deleteUpload(relPath) {
  const full = resolveUpload(relPath);
  if (full) fs.rm(full, { force: true }, () => {});
}

module.exports = { UPLOAD_ROOT, saveFile, resolveUpload, deleteUpload };