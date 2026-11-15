const router = require('express').Router();
const institutions = require('../controllers/institutionController');

router.get('/', institutions.list);
router.post('/', institutions.create);

module.exports = router;