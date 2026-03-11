const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { auth, admin } = require('../middleware/auth');

router.post('/', contactController.submitContact);
router.get('/', auth, admin, contactController.getAllContacts);
router.get('/my-messages', auth, contactController.getUserMessages);
router.post('/reply/:id', auth, admin, contactController.replyToContact);
router.post('/user-reply/:id', auth, contactController.userReplyToContact);
router.delete('/:id', auth, admin, contactController.deleteContact);
router.delete('/user/:id', auth, contactController.userDeleteContact);

module.exports = router;
