const router = require('express').Router();
const admin = require('../controllers/adminController');

router.get('/admin/pending', admin.getPending);
router.get('/admin/dashboard', admin.getDashboard);
router.get('/admin/audit-log', admin.getAuditLog);
router.post('/admin/verify-bulk', admin.bulkVerify);
router.patch('/alumni/:id/status', admin.setStatus);

module.exports = router;