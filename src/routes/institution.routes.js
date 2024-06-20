const express = require('express');
const router = express.Router();

// TODO: Implement institution controller
// const institutionController = require('../controllers/institution.controller');

router.post('/events', (req, res) => {
  // TODO: Implement create event
  res.status(501).json({ message: 'Create event not implemented yet' });
});

router.get('/events', (req, res) => {
  // TODO: Implement get institution events
  res.status(501).json({ message: 'Get institution events not implemented yet' });
});

router.put('/events/:id', (req, res) => {
  // TODO: Implement update event
  res.status(501).json({ message: 'Update event not implemented yet' });
});

router.delete('/events/:id', (req, res) => {
  // TODO: Implement delete event
  res.status(501).json({ message: 'Delete event not implemented yet' });
});

module.exports = router;