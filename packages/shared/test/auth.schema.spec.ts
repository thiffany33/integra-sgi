import { describe, expect, it } from 'vitest';
import { changePasswordSchema, registerSchema, resetPasswordSchema, updateAccountSchema, updateCustomerProfileSchema, userRoleSchema } from '../src/auth/auth.schema';

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

  it('accepts only known persisted user roles and never a role supplied during registration', () => {
    expect(userRoleSchema.parse('CUSTOMER')).toBe('CUSTOMER');
    expect(userRoleSchema.parse('PLATFORM_ADMIN')).toBe('PLATFORM_ADMIN');
    expect(userRoleSchema.safeParse('ADMIN').success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegistration, role: 'PLATFORM_ADMIN' }).success).toBe(false);
  });

  it('requires profile revisions and strong passwords for recovery', () => {
    const { organization, representative } = validRegistration.profile;
    const editableProfile = { organization, representative };
    expect(updateCustomerProfileSchema.safeParse({ revision: 1, profile: editableProfile }).success).toBe(true);
    expect(updateCustomerProfileSchema.safeParse({ revision: 0, profile: editableProfile }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: 'a'.repeat(64), password: 'a-short' }).success).toBe(false);
  });

  it('rejects selected systems and schema version in customer profile updates', () => {
    const { organization, representative } = validRegistration.profile;
    expect(updateCustomerProfileSchema.safeParse({
      revision: 1,
      profile: { organization, representative, selectedSystems: ['sgsst'] },
    }).success).toBe(false);
    expect(updateCustomerProfileSchema.safeParse({
      revision: 1,
      profile: { organization, representative, schemaVersion: 1 },
    }).success).toBe(false);
  });
});

describe('account settings schemas', () => {
  it('trims the name and normalizes the email', () => {
    expect(updateAccountSchema.parse({ name: ' Ana Silva ', email: ' ANA@EXAMPLE.PT ' }))
      .toEqual({ name: 'Ana Silva', email: 'ana@example.pt' });
  });

  it('rejects role fields, empty names, and invalid email addresses', () => {
    expect(updateAccountSchema.safeParse({ name: 'Ana', email: 'ana@example.pt', role: 'admin' }).success).toBe(false);
    expect(updateAccountSchema.safeParse({ name: ' ', email: 'ana@example.pt' }).success).toBe(false);
    expect(updateAccountSchema.safeParse({ name: 'Ana', email: 'invalid' }).success).toBe(false);
  });

  it('requires the current password and a strong new password without extra fields', () => {
    expect(changePasswordSchema.safeParse({ currentPassword: '', newPassword: 'correct-horse-battery' }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: 'old-password', newPassword: 'short' }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: 'old-password', newPassword: 'correct-horse-battery', role: 'admin' }).success).toBe(false);
    expect(changePasswordSchema.safeParse({ currentPassword: 'old-password', newPassword: 'correct-horse-battery' }).success).toBe(true);
  });
});
