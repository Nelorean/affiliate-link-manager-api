const prisma = require('../config/prisma');

async function createLink(userId, data) {
  const existingLink = await prisma.link.findUnique({
    where: { slug: data.slug },
  });
  if (existingLink) {
    const error = new Error('Slug já está em uso');
    error.statusCode = 409;
    throw error;
  }

  const link = await prisma.link.create({
    data: {
      userId,
      title: data.title,
      originalUrl: data.originalUrl,
      slug: data.slug,
      campaign: data.campaign,
      notes: data.notes,
      expiresAt: data.expiresAt,
    },
  });

  return link;
}

async function listLinks(userId, validatedQuery) {
  const { page, limit, campaign, search, isActive } = validatedQuery;
  const skip = (page - 1) * limit;
  const where = { userId };
  if (campaign) {
    where.campaign = campaign;
  }
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        slug: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ];
  }
  const links = await prisma.link.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });
  const total = await prisma.link.count({
    where,
  });
  const totalPages = Math.ceil(total / limit);
  const returnObj = { links, page, limit, total, totalPages };
  return returnObj;
}

async function getLinkById(userId, linkId) {
  const link = await prisma.link.findFirst({
    where: { userId, id: linkId },
  });
  if (!link) {
    const error = new Error('Link não existe');
    error.statusCode = 404;
    throw error;
  }
  return link;
}
async function updateLink(userId, linkId, data) {
  const link = await getLinkById(userId, linkId);
  if (data.slug && data.slug !== link.slug) {
    const conflictingLink = await prisma.link.findUnique({
      where: { slug: data.slug },
    });
    if (conflictingLink) {
      const error = new Error('Slug já existente');
      error.statusCode = 409;
      throw error;
    }
  }
  const updatedLink = await prisma.link.update({
    where: { id: linkId },
    data,
  });
  return updatedLink;
}

async function deactivateLink(userId, linkId) {
  await getLinkById(userId, linkId);
  const deactivatedLink = await prisma.link.update({
    where: { id: linkId },
    data: {
      isActive: false,
    },
  });
  return deactivatedLink;
}
async function resolveLinkBySlug(slug) {
  const link = await prisma.link.findUnique({
    where: { slug },
  });
  if (!link) {
    const error = new Error('Link não existe');
    error.statusCode = 404;
    throw error;
  }
  if (!link.isActive) {
    const error = new Error('Link inativo');
    error.statusCode = 410;
    throw error;
  }
  if (link.expiresAt && link.expiresAt < new Date()) {
    const error = new Error('Link expirado');
    error.statusCode = 410;
    throw error;
  }
  const updatedLink = await prisma.link.update({
    where: { id: link.id },
    data: { clicks: { increment: 1 } },
  });
  return updatedLink;
}
module.exports = {
  createLink,
  listLinks,
  getLinkById,
  updateLink,
  deactivateLink,
  resolveLinkBySlug,
};
