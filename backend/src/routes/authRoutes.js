const express = require('express');
const { adminLogin, studentLogin, login } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/student-login', studentLogin);

module.exports = router;
