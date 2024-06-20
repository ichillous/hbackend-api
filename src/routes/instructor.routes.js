const express = require('express');
const router = express.Router();

// TODO: Implement instructor controller
// const instructorController = require('../controllers/instructor.controller');

router.post('/groups', (req, res) => {
  // TODO: Implement create group (class or circle)
  res.status(501).json({ message: 'Create group not implemented yet' });
});

router.get('/groups', (req, res) => {
  // TODO: Implement get instructor groups
  res.status(501).json({ message: 'Get instructor groups not implemented yet' });
});

router.put('/groups/:id', (req, res) => {
  // TODO: Implement update group
  res.status(501).json({ message: 'Update group not implemented yet' });
});

router.delete('/groups/:id', (req, res) => {
  // TODO: Implement delete group
  res.status(501).json({ message: 'Delete group not implemented yet' });
});

module.exports = router;