const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, groupController.createGroup);
router.post('/:id/join', authMiddleware, groupController.joinGroup);router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroupById);
router.put('/:id', authMiddleware, groupController.updateGroup);
router.delete('/:id', authMiddleware, groupController.deleteGroup);


module.exports = router;