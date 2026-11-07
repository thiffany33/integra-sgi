import { describe, expect, it } from 'vitest';
import {
  getOrganizationDiscoverySaveSchema,
  organizationDiscoveryResponseSchemas,
  organizationDiscoveryStepNumberSchema,
} from './organization-discovery.schema';

const save = (step: number, answers: unknown, revision = 0) =>
  getOrganizationDiscoverySaveSchema(step)?.safeParse({ revision, answers }).success;

describe('organization discovery draft saves', () => {
  it.each([1, 2, 3, 4, 5])('accepts an empty draft for step %i', (step) => {
    expect(save(step, {})).toBe(true);
  });

  it('accepts a partial organization context without copying profile identity', () => {
    expect(save(1, { workforceRange: '1-9', workLocation: 'hybrid', primaryLocation: ' Porto ', yearsInOperation: 12 })).toBe(true);
    expect(save(1, { workforceRange: '10-49' })).toBe(true);
    expect(save(1, { name: 'Acme' })).toBe(false);
    expect(save(1, { representative: { name: 'Ana' } })).toBe(false);
  });

  it('accepts partial activity and customer context', () => {
    expect(save(2, { activityTypes: ['services'], customerTypes: ['businesses'], operatingAreas: ['local'], activityDescription: 'Repairs' })).toBe(true);
    expect(save(2, { customerTypes: ['consumers'] })).toBe(true);
  });

  it('accepts partial people answers and additional person cards', () => {
    expect(save(3, { responsibilityAssignments: [{ role: 'quality', personName: 'Ana' }], additionalPeople: [{ name: 'Eva', role: 'Operations' }] })).toBe(true);
    expect(save(3, { additionalPeople: [] })).toBe(true);
  });

  it('accepts processes without requiring owner or frequency', () => {
    expect(save(4, { processes: [{ activity: 'purchasing' }, { activity: 'other', customName: 'Equipment maintenance', owner: 'Rui', frequency: 'monthly' }] })).toBe(true);
  });

  it('accepts attention topics without notes', () => {
    expect(save(5, { attentionTopics: ['complaints', 'training_needs'] })).toBe(true);
    expect(save(5, { notes: 'Check stock records.' })).toBe(true);
  });

  it.each([
    [1, { workforceRange: 'many' }],
    [1, { workLocation: 'abroad' }],
    [2, { activityTypes: ['unknown'] }],
    [2, { customerTypes: ['unknown'] }],
    [2, { operatingAreas: ['unknown'] }],
    [3, { responsibilityAssignments: [{ role: 'auditor', personName: 'Ana' }] }],
    [4, { processes: [{ activity: 'unknown' }] }],
    [4, { processes: [{ activity: 'sales', frequency: 'never' }] }],
    [5, { attentionTopics: ['unknown'] }],
  ])('rejects an unsupported choice in step %i', (step, answers) => {
    expect(save(step as number, answers)).toBe(false);
  });

  it('bounds free text and numeric answers', () => {
    expect(save(1, { primaryLocation: 'x'.repeat(121) })).toBe(false);
    expect(save(1, { yearsInOperation: -1 })).toBe(false);
    expect(save(2, { activityDescription: 'x'.repeat(1001) })).toBe(false);
    expect(save(3, { additionalPeople: [{ name: 'x'.repeat(161), role: 'Owner' }] })).toBe(false);
    expect(save(4, { processes: [{ activity: 'other', customName: 'x'.repeat(161) }] })).toBe(false);
    expect(save(5, { notes: 'x'.repeat(1001) })).toBe(false);
  });

  it('limits arrays to a useful draft size and rejects duplicates', () => {
    expect(save(2, { activityTypes: Array(11).fill('services') })).toBe(false);
    expect(save(3, { additionalPeople: Array(21).fill({ name: 'Ana', role: 'Owner' }) })).toBe(false);
    expect(save(4, { processes: Array(21).fill({ activity: 'sales' }) })).toBe(false);
    expect(save(5, { attentionTopics: ['complaints', 'complaints'] })).toBe(false);
  });

  it('rejects unknown keys at every save boundary and invalid revisions', () => {
    expect(save(1, { workforceRange: '1-9', nif: '123' })).toBe(false);
    expect(save(3, { additionalPeople: [{ name: 'Ana', role: 'Owner', email: 'ana@example.pt' }] })).toBe(false);
    expect(save(4, { processes: [{ activity: 'sales', unexpected: true }] })).toBe(false);
    expect(getOrganizationDiscoverySaveSchema(1)?.safeParse({ revision: 0, answers: {}, unknown: true }).success).toBe(false);
    expect(save(1, {}, -1)).toBe(false);
  });

  it('rejects unsupported save steps, including review step 6', () => {
    expect(organizationDiscoveryStepNumberSchema.safeParse(6).success).toBe(false);
    expect(getOrganizationDiscoverySaveSchema(0)).toBeUndefined();
    expect(getOrganizationDiscoverySaveSchema(6)).toBeUndefined();
    expect(getOrganizationDiscoverySaveSchema(1.5)).toBeUndefined();
  });

  it('keeps profile identity out of requirement response JSON', () => {
    expect(organizationDiscoveryResponseSchemas['4.1'].safeParse({ workforceRange: '1-9', activityTypes: ['services'] }).success).toBe(true);
    expect(organizationDiscoveryResponseSchemas['4.1'].safeParse({ email: 'a@example.pt' }).success).toBe(false);
    expect(organizationDiscoveryResponseSchemas['4.2'].safeParse({ representativeName: 'Ana' }).success).toBe(false);
  });
});
