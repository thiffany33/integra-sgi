import { z } from 'zod';
import { customerProfileSchema } from '../profile/profile.schema';

export const supportedLocales = ['pt-PT', 'en', 'fr', 'de'] as const;
export const localeSchema = z.enum(supportedLocales);

const accountEmailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((email) => email.toLowerCase());

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(160),
    email: accountEmailSchema,
    password: z.string().min(12).max(128),
    locale: localeSchema.default('pt-PT'),
    profile: customerProfileSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: accountEmailSchema,
    password: z.string().min(1).max(128),
  })
  .strict();

const editableCustomerProfileSchema = z.object({
  organization: customerProfileSchema.shape.organization,
  representative: customerProfileSchema.shape.representative,
}).strict();

export const updateCustomerProfileSchema = z.object({
  revision: z.number().int().min(1),
  profile: editableCustomerProfileSchema,
}).strict();
export const updateLocaleSchema = z.object({ locale: localeSchema }).strict();
export const updateAccountSchema = z.object({
  name: z.string().trim().min(1).max(160),
  email: accountEmailSchema,
}).strict();
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z.string().min(12).max(128),
}).strict();

export const forgotPasswordSchema = z.object({ email: accountEmailSchema }).strict();
export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(12).max(128),
}).strict();
export const verifyEmailSchema = z.object({ token: z.string().min(32).max(256) }).strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
export type SupportedLocale = z.infer<typeof localeSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
