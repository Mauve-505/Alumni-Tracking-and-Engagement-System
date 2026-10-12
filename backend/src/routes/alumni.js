const router = require('express').Router();
const { getAlumni } = require('../controllers/alumniController');

router.get('/', getAlumni);

module.exports = router;