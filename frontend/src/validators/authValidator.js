import { z } from 'zod';

// Regex mendeteksi payload SQL injection standar, comment block, inline statement, dsb.
const sqlInjectionRegex = /('|"--|#|\b(UNION|SELECT|DROP|ALTER|DELETE|UPDATE|INSERT|OR|AND)\b)/i;

export const loginSchema = z.object({
  username: z.string()
    .min(4, { message: 'Username/Email minimal 4 karakter' })
    .max(50, { message: 'Username/Email maksimal 50 karakter' })
    .refine((val) => !sqlInjectionRegex.test(val), {
      message: 'Format karakter input tidak diizinkan oleh sistem keamanan.',
    }),
  password: z.string()
    .min(8, { message: 'Password minimal 8 karakter' })
    .max(100, { message: 'Password maksimal 100 karakter' })
    .refine((val) => !sqlInjectionRegex.test(val), {
      message: 'Format karakter password tidak valid.',
    }),
  rememberMe: z.boolean().optional(),
});