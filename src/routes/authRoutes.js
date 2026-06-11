const express = require('express');

const authController = require('../controllers/authController');
const validateBody = require('../middlewares/validateBody');
const { registerSchema } = require('../validations/authValidation');

const router = express.Router();

router.post('/register', validateBody(registerSchema), authController.register);

module.exports = router;
