const router = require('express').Router();
const { getAlumni, getAlumniById, updateAlumni } = require('../controllers/alumniController');
const employment = require('../controllers/employmentController');
const education = require('../controllers/educationController');

router.get('/', getAlumni);
router.get('/:id', getAlumniById);
router.put('/:id', updateAlumni);

router.get('/:profileId/employment', employment.list);
router.post('/:profileId/employment', employment.add);
router.get('/:profileId/education', education.list);
router.post('/:profileId/education', education.add);

module.exports = router;