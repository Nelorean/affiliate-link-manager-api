const express = require('express');

const linkController = require('../controllers/linkController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateBody = require('../middlewares/validateBody');
const {
  createLinkSchema,
  updateLinkSchema,
  listLinksQuerySchema,
} = require('../validations/linkValidation');
const validateQuery = require('../middlewares/validateQuery');

const router = express.Router();

router.post(
  '/',
  authMiddleware,
  validateBody(createLinkSchema),
  linkController.create,
);
router.get(
  '/',
  authMiddleware,
  validateQuery(listLinksQuerySchema),
  linkController.list,
);
router.get('/:id', authMiddleware, linkController.getById);
router.patch(
  '/:id',
  authMiddleware,
  validateBody(updateLinkSchema),
  linkController.update,
);
router.delete('/:id', authMiddleware, linkController.deactivate);

module.exports = router;
