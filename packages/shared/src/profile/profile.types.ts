import type { z } from 'zod';
import type { customerProfileSchema } from './profile.schema';

export type CustomerProfileInput = z.infer<typeof customerProfileSchema>;
export type SelectedSystem = CustomerProfileInput['selectedSystems'][number];
