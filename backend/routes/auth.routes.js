const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { auth, admin } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authController.changePassword);
router.put('/users/:id', auth, authController.updateUser);
router.get('/users', auth, admin, authController.getAllUsers);

router.delete('/users/:id', auth, admin, authController.deleteUser);

module.exports = router;
