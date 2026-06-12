const authService = require('../services/authService');

async function register(req, res) {
  try {
    const user = await authService.registerUser(req.body);

    return res.status(201).json({ user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}
async function login(req, res) {
  try {
    const result = await authService.loginUser(req.body);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}
async function me(req, res) {
  try {
    const user = await authService.getUserById(req.userId);

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}

module.exports = {
  register,
  login,
  me,
};
