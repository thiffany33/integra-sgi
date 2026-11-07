import { z } from 'zod';

export const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(4000),
  // Honeypot: hidden from people, so a value means an automated submission.
  website: z.string().max(200).optional(),
}).strict();

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
