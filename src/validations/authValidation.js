const { z } = require('zod');

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.email('E-mail inválido').toLowerCase(),
    phone: z
      .string()
      .trim()
      .min(8, 'Telefone deve ter pelo menos 8 caracteres')
      .optional(),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(/[A-Z]/, 'A senha deve ter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'A senha deve ter pelo menos um número')
      .regex(
        /[^A-Za-z0-9]/,
        'A senha deve ter pelo menos um caractere especial',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

module.exports = {
  registerSchema,
};
