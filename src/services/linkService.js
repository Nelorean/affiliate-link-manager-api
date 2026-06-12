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

module.exports = {
  createLink,
};
