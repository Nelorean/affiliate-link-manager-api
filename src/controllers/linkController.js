const linkService = require('../services/linkService');

async function create(req, res) {
  try {
    const link = await linkService.createLink(req.userId, req.body);
    return res.status(201).json({ link });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}

module.exports = {
  create,
};
