import { z } from 'zod';

export const passwordRule = z.string().min(8, { message: 'Password must be at least 8 characters.' });

export const ResetPasswordSchema = z.object({
  password: passwordRule,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});
