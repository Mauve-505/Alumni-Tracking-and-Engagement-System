const router = require('express').Router();
const employment = require('../controllers/employmentController');
const education = require('../controllers/educationController');

router.put('/employment/:id', employment.update);
router.delete('/employment/:id', employment.remove);
router.put('/education/:id', education.update);
router.delete('/education/:id', education.remove);

module.exports = router;