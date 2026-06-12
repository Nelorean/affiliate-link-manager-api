const express = require('express');

const linkController = require('../controllers/linkController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validateBody');
const { createLinkSchema } = require('../validations/linkValidation');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  validateBody(createLinkSchema),
  linkController.create,
);
router.get('/', authMiddleware, linkController.list);

module.exports = router;
