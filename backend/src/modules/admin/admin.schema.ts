import { z } from 'zod';
import { selectedSystemSchema } from '@integra/shared/profile';

export const listCustomersSchema = z.object({
  search: z.string().trim().max(160).optional(),
  cursor: z.string().regex(/^[a-z0-9]{20,32}$/).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
}).strict();

export const updateCustomerSystemsSchema = z.object({
  selectedSystems: z.array(selectedSystemSchema).min(1).max(3).refine(
    (systems) => new Set(systems).size === systems.length,
    'Each system can only be selected once.',
  ),
  revision: z.number().int().min(1),
}).strict();

export type ListCustomersInput = z.infer<typeof listCustomersSchema>;
export type UpdateCustomerSystemsInput = z.infer<typeof updateCustomerSystemsSchema>;
