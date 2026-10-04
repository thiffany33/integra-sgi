import { z } from 'zod';

const requiredText = (maximum: number) =>
  z.string().trim().min(1).max(maximum);

const emailAddress = z.string().trim().email().max(254);

export const selectedSystemSchema = z.enum(['sgq', 'sga', 'sgsst']);

export const customerProfileSchema = z
  .object({
    schemaVersion: z.literal(1),
    organization: z
      .object({
        name: requiredText(160),
        nif: requiredText(32),
        sector: requiredText(100),
        email: emailAddress,
      })
      .strict(),
    representative: z
      .object({
        name: requiredText(160),
        email: z.union([emailAddress, z.literal('')]),
        phone: z.string().trim().max(40),
      })
      .strict(),
    selectedSystems: z.array(selectedSystemSchema).min(1).max(3),
  })
  .strict()
  .superRefine((profile, context) => {
    if (new Set(profile.selectedSystems).size !== profile.selectedSystems.length) {
      context.addIssue({
        code: 'custom',
        path: ['selectedSystems'],
        message: 'Each system can only be selected once.',
      });
    }
  });
