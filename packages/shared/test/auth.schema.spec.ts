import { describe, expect, it } from 'vitest';
import { registerSchema, resetPasswordSchema, updateCustomerProfileSchema } from '../src/auth/auth.schema';

const validRegistration = {
  name: 'Ana Silva',
  email: ' ANA@EXAMPLE.PT ',
  password: 'correct-horse-battery-staple',
  locale: 'pt-PT',
  profile: {
    schemaVersion: 1,
    organization: {
      name: 'Integra SGI',
      nif: '123456789',
      sector: 'Serviços',
      email: 'contact@example.pt',
    },
    representative: { name: 'Ana Silva', email: '', phone: '' },
    selectedSystems: ['sgq'],
  },
};

describe('registerSchema', () => {
  it('normalizes account email to lowercase', () => {
    expect(registerSchema.parse(validRegistration).email).toBe('ana@example.pt');
  });

  it('rejects passwords shorter than 12 characters', () => {
    expect(registerSchema.safeParse({ ...validRegistration, password: 'short' }).success).toBe(false);
  });

  it('rejects locale values outside the four supported languages', () => {
    expect(registerSchema.safeParse({ ...validRegistration, locale: 'pt-BR' }).success).toBe(false);
  });

  it('requires profile revisions and strong passwords for recovery', () => {
    expect(updateCustomerProfileSchema.safeParse({ revision: 1, profile: validRegistration.profile }).success).toBe(true);
    expect(updateCustomerProfileSchema.safeParse({ revision: 0, profile: validRegistration.profile }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: 'a'.repeat(64), password: 'a-short' }).success).toBe(false);
  });
});
