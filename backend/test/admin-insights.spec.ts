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

  it('measures how long completed discoveries took, from the first start to the first completion', () => {
    const started = new Date('2026-11-01T00:00:00Z');
    const after = (days: number) => new Date(started.getTime() + days * 86_400_000);
    const completed = (days: number) => customer({ discovery: { status: 'COMPLETED', currentStep: 6, startedAt: started, completedAt: after(days) } });
    const insights = buildInsights([
      completed(0.5), completed(3), completed(10), completed(40),
      customer({ discovery: { status: 'IN_PROGRESS', currentStep: 2, startedAt: started, completedAt: null } }),
    ], now);
    expect(insights.completionDays).toEqual({
      median: 6.5,
      buckets: [{ value: 'under1', count: 1 }, { value: '1to7', count: 1 }, { value: '8to30', count: 1 }, { value: 'over30', count: 1 }],
    });
    expect(buildInsights([], now).completionDays.median).toBeNull();
  });

  it('counts template downloads by organization, listing templates nobody downloaded yet', () => {
    const insights = buildInsights([], now, [
      { documentId: 'swot-analysis', userId: 'a', downloads: 3 },
      { documentId: 'swot-analysis', userId: 'b', downloads: 1 },
      { documentId: 'value-chain', userId: 'a', downloads: 1 },
    ], ['value-chain', 'swot-analysis', 'interested-parties']);
    expect(insights.templateDownloads).toEqual([
      { value: 'swot-analysis', count: 2, downloads: 4 },
      { value: 'value-chain', count: 1, downloads: 1 },
      { value: 'interested-parties', count: 0, downloads: 0 },
    ]);
  });
});
