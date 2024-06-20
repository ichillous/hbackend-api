const express = require('express');
const router = express.Router();

// TODO: Implement group controller
// const groupController = require('../controllers/group.controller');

router.get('/', (req, res) => {
  // TODO: Implement get all groups (classes and circles)
  res.status(501).json({ message: 'Get all groups not implemented yet' });
});

router.get('/:id', (req, res) => {
  // TODO: Implement get group by id
  res.status(501).json({ message: 'Get group by id not implemented yet' });
});

router.post('/', (req, res) => {
  // TODO: Implement create group (class or circle)
  res.status(501).json({ message: 'Create group not implemented yet' });
});

router.put('/:id', (req, res) => {
  // TODO: Implement update group
  res.status(501).json({ message: 'Update group not implemented yet' });
});

router.delete('/:id', (req, res) => {
  // TODO: Implement delete group
  res.status(501).json({ message: 'Delete group not implemented yet' });
});

router.post('/:id/join', (req, res) => {
  // TODO: Implement join group (enroll in class or join circle)
  res.status(501).json({ message: 'Join group not implemented yet' });
});

router.get('/:id/members', (req, res) => {
  // TODO: Implement get group members
  res.status(501).json({ message: 'Get group members not implemented yet' });
});

router.get('/:id/schedule', (req, res) => {
  // TODO: Implement get group schedule (mainly for classes)
  res.status(501).json({ message: 'Get group schedule not implemented yet' });
});

module.exports = router;