const router = require('express').Router();
const admin = require('../controllers/adminController');

router.get('/admin/pending', admin.getPending);
router.get('/admin/dashboard', admin.getDashboard);
router.patch('/alumni/:id/status', admin.setStatus);

module.exports = router;