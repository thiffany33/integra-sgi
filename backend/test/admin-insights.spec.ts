import { describe, expect, it } from 'vitest';
import { buildInsights, type InsightCustomer } from '../src/modules/admin/admin-insights';

const now = new Date('2026-11-15T12:00:00Z');
const customer = (overrides: Partial<InsightCustomer>): InsightCustomer => ({
  createdAt: new Date('2026-11-01T00:00:00Z'),
  emailVerifiedAt: null,
  profile: { organization: { sector: 'Serviços' }, selectedSystems: ['sgq'] },
  discovery: null,
  responses: {},
  ...overrides,
});

describe('buildInsights', () => {
  it('counts the funnel and where in-progress discoveries stopped', () => {
    const insights = buildInsights([
      customer({}),
      customer({ emailVerifiedAt: now, discovery: { status: 'IN_PROGRESS', currentStep: 3 } }),
      customer({ emailVerifiedAt: now, discovery: { status: 'COMPLETED', currentStep: 6 } }),
    ], now);
    expect(insights.funnel).toEqual({ registered: 3, emailVerified: 2, discoveryStarted: 2, discoveryCompleted: 1 });
    expect(insights.stoppedAtStep.find((step) => step.value === '3')?.count).toBe(1);
    expect(insights.stoppedAtStep.reduce((total, step) => total + step.count, 0)).toBe(1);
  });

  it('aggregates answers without counting empty discoveries as answered', () => {
    const insights = buildInsights([
      customer({
        profile: { organization: { sector: 'Indústria' }, selectedSystems: ['sgq', 'sga'] },
        responses: {
          '4.1': { workforceRange: '10-49', activityTypes: ['services', 'trade'] },
          '4.4': { processes: [{ activity: 'sales' }, { activity: 'sales' }] },
          '6.1': { attentionTopics: ['delays'] },
        },
      }),
      // Steps marked complete with nothing filled in, as older accounts may have.
      customer({ responses: { '4.1': {}, '4.4': { processes: [] }, '6.1': {} } }),
    ], now);
    expect(insights.answered).toEqual({ organization: 1, activity: 1, processes: 1, attention: 1 });
    expect(insights.selectedSystems).toEqual([
      { value: 'sgq', count: 2 }, { value: 'sga', count: 1 }, { value: 'sgsst', count: 0 },
    ]);
    expect(insights.sectors[0]).toEqual({ value: 'Indústria', count: 1 });
    expect(insights.workforceRanges.map((range) => range.value)).toEqual(['1-9', '10-49', '50-249', '250+']);
    // An organization listing the same activity twice still counts once.
    expect(insights.processActivities[0]).toEqual({ value: 'sales', count: 1 });
    expect(insights.attentionTopics[0]).toEqual({ value: 'delays', count: 1 });
  });

  it('reports registrations for the last twelve months, ignoring older ones', () => {
    const insights = buildInsights([
      customer({ createdAt: new Date('2026-11-02T00:00:00Z') }),
      customer({ createdAt: new Date('2025-12-31T00:00:00Z') }),
      customer({ createdAt: new Date('2025-11-30T00:00:00Z') }),
    ], now);
    expect(insights.registrationsByMonth).toHaveLength(12);
    expect(insights.registrationsByMonth[0]).toEqual({ value: '2025-12', count: 1 });
    expect(insights.registrationsByMonth.at(-1)).toEqual({ value: '2026-11', count: 1 });
  });
});
