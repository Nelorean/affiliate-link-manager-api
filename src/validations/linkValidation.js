const { z } = require('zod');

const createLinkSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Título deve ter pelo menos 2 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  originalUrl: z
    .string()
    .trim()
    .max(2048, 'URL deve ter no máximo 2048 caracteres')
    .url('URL inválida')
    .refine((value) => {
      const protocol = new URL(value).protocol;
      return protocol === 'http:' || protocol === 'https:';
    }, 'A URL deve usar HTTP ou HTTPS'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Deve ter pelo menos 3 caracteres')
    .max(40, 'Deve ter no máximo 40 caracteres')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug deve conter apenas letras minúsculas, números e hífens simples',
    ),
  campaign: z
    .string()
    .trim()
    .max(100, 'Campanha deve conter no máximo 100 caracteres')
    .optional(),
  notes: z
    .string()
    .trim()
    .max(500, 'Observações devem conter no máximo 500 caracteres')
    .optional(),
  expiresAt: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: 'A data de expiração deve estar no futuro',
    })
    .optional(),
});

module.exports = {
  createLinkSchema,
};
