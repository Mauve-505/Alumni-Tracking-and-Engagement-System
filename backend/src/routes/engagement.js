const router = require('express').Router();
const engagement = require('../controllers/engagementController');

router.get('/posts', engagement.listPosts);
router.post('/posts', engagement.createPost);
router.put('/posts/:id', engagement.updatePost);
router.patch('/posts/:id', engagement.updatePost);
router.delete('/posts/:id', engagement.deletePost);

router.get('/events', engagement.listEvents);
router.post('/events', engagement.createEvent);
router.put('/events/:id', engagement.updateEvent);
router.patch('/events/:id', engagement.updateEvent);
router.delete('/events/:id', engagement.deleteEvent);
router.post('/events/:id/rsvp', engagement.submitRsvp);
router.get('/events/:id/rsvps', engagement.listRsvps);
router.get('/admin/rsvps', engagement.listRsvps);

module.exports = router;