const express = require('express');

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validateBody');
const {
  registerSchema,
  loginSchema,
} = require('../validations/authValidation');

const router = express.Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
