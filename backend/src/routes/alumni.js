const router = require('express').Router();
const { getAlumni, getAlumniById, updateAlumni } = require('../controllers/alumniController');
const employment = require('../controllers/employmentController');
const education = require('../controllers/educationController');
const upload = require('../controllers/uploadController');
const { rawFile } = require('./uploads');

router.get('/', getAlumni);
router.get('/:id', getAlumniById);
router.put('/:id', updateAlumni);

router.post('/:id/photo', rawFile, upload.profilePhoto);
router.post('/:id/certificate', rawFile, upload.certificate);
router.get('/:id/certificate', upload.viewCertificate);

router.get('/:profileId/employment', employment.list);
router.post('/:profileId/employment', employment.add);
router.get('/:profileId/education', education.list);
router.post('/:profileId/education', education.add);

module.exports = router;