import { describe, expect, it } from 'vitest';
import { customerProfileSchema } from '../src/profile/profile.schema';

const validProfile = {
  schemaVersion: 1,
  organization: {
    name: 'Integra SGI',
    nif: '123456789',
    sector: 'Serviços',
    email: 'contact@example.pt',
  },
  representative: {
    name: 'Ana Silva',
    email: '',
    phone: '',
  },
  selectedSystems: ['sgq', 'sga'],
};

describe('customerProfileSchema', () => {
  it('accepts the current organization, representative, and selected system fields', () => {
    expect(customerProfileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('rejects a schema version the API does not understand', () => {
    expect(customerProfileSchema.safeParse({ ...validProfile, schemaVersion: 2 }).success).toBe(false);
  });

  it('rejects unknown fields rather than silently persisting them', () => {
    expect(customerProfileSchema.safeParse({ ...validProfile, unknown: true }).success).toBe(false);
  });

  it('rejects unknown fields nested inside the organization data', () => {
    expect(
      customerProfileSchema.safeParse({
        ...validProfile,
        organization: { ...validProfile.organization, secret: 'must-not-be-stored' },
      }).success,
    ).toBe(false);
  });

  it('rejects unsupported system identifiers', () => {
    expect(customerProfileSchema.safeParse({ ...validProfile, selectedSystems: ['iso9001'] }).success).toBe(false);
  });
});
