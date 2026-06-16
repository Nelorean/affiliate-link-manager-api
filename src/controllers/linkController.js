const linkService = require('../services/linkService');

const recentRedirects = new Map();
const DUPLICATE_CLICK_WINDOW_MS = 3000;

function shouldCountClick(req) {
  const userAgent = req.get('user-agent') || 'unknown-agent';
  const forwardedFor = req.get('x-forwarded-for') || req.ip;
  const key = `${req.params.slug}:${forwardedFor}:${userAgent}`;
  const now = Date.now();
  const lastClickAt = recentRedirects.get(key);

  if (lastClickAt && now - lastClickAt < DUPLICATE_CLICK_WINDOW_MS) {
    return false;
  }

  recentRedirects.set(key, now);

  for (const [storedKey, storedAt] of recentRedirects.entries()) {
    if (now - storedAt > DUPLICATE_CLICK_WINDOW_MS) {
      recentRedirects.delete(storedKey);
    }
  }

  return true;
}

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

async function list(req, res) {
  try {
    const result = await linkService.listLinks(req.userId, req.validatedQuery);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}

async function getById(req, res) {
  try {
    const link = await linkService.getLinkById(req.userId, req.params.id);
    return res.status(200).json({ link });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}
async function update(req, res) {
  try {
    const link = await linkService.updateLink(
      req.userId,
      req.params.id,
      req.body,
    );
    return res.status(200).json({ link });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}
async function deactivate(req, res) {
  try {
    const link = await linkService.deactivateLink(req.userId, req.params.id);
    return res.status(200).json({ link });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}
async function publicRedirect(req, res) {
  try {
    const link = await linkService.resolveLinkBySlug(req.params.slug, {
      countClick: shouldCountClick(req),
    });
    return res.redirect(link.originalUrl);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Erro interno do servidor',
    });
  }
}

async function publicRedirectHead(req, res) {
  try {
    const link = await linkService.getValidLinkBySlug(req.params.slug);
    return res.redirect(link.originalUrl);
  } catch (error) {
    return res.status(error.statusCode || 500).end();
  }
}

module.exports = {
  create,
  list,
  getById,
  update,
  deactivate,
  publicRedirectHead,
  publicRedirect,
};
