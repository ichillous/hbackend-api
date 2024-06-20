const express = require('express');
const router = express.Router();

// TODO: Implement event controller
// const eventController = require('../controllers/event.controller');

router.get('/', (req, res) => {
  // TODO: Implement get all events
  res.status(501).json({ message: 'Get all events not implemented yet' });
});

router.get('/:id', (req, res) => {
  // TODO: Implement get event by id
  res.status(501).json({ message: 'Get event by id not implemented yet' });
});

router.post('/:id/rsvp', (req, res) => {
  // TODO: Implement RSVP to event
  res.status(501).json({ message: 'RSVP to event not implemented yet' });
});

module.exports = router;