import type { CustomerProfileInput, SelectedSystem } from '@integra/shared/profile';
import {
  activityTypeSchema,
  attentionTopicSchema,
  customerTypeSchema,
  operatingAreaSchema,
  processActivitySchema,
  workforceRangeSchema,
} from '@integra/shared/requirements';

export type InsightCustomer = {
  createdAt: Date;
  emailVerifiedAt: Date | null;
  profile: unknown;
  discovery: { status: 'IN_PROGRESS' | 'COMPLETED'; currentStep: number; startedAt?: Date; completedAt?: Date | null } | null;
  responses: Record<string, unknown>;
};

export type Count<T extends string = string> = { value: T; count: number };

/** Downloads of one template: distinct organizations (count) and all downloads. */
export type TemplateDownloadCount = { value: string; count: number; downloads: number };

export type CompletionBucket = 'under1' | '1to7' | '8to30' | 'over30';

export type AdminInsights = {
  generatedAt: string;
  funnel: { registered: number; emailVerified: number; discoveryStarted: number; discoveryCompleted: number };
  /** Discoveries in progress, by the first step still unanswered. */
  stoppedAtStep: Count<'1' | '2' | '3' | '4' | '5'>[];
  registrationsByMonth: Count[];
  /** How many organizations answered each question; percentages use these as the base. */
  answered: { organization: number; activity: number; processes: number; attention: number };
  selectedSystems: Count<SelectedSystem>[];
  sectors: Count[];
  workforceRanges: Count[];
  activityTypes: Count[];
  customerTypes: Count[];
  operatingAreas: Count[];
  processActivities: Count[];
  attentionTopics: Count[];
  /** Days from starting to first completing the discovery, for completed discoveries. */
  completionDays: { median: number | null; buckets: Count<CompletionBucket>[] };
  templateDownloads: TemplateDownloadCount[];
};

const MONTHS = 12;

/** Counts values; known options are listed even at zero. Scales keep their order, categories are ranked. */
function tally<T extends string>(values: Iterable<T>, options: readonly T[] = [], keepOrder = false): Count<T>[] {
  const counts = new Map<T, number>(options.map((value) => [value, 0]));
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const result = [...counts].map(([value, count]) => ({ value, count }));
  return keepOrder ? result : result.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Aggregates customers into counts only, so the dashboard never exposes an individual answer. */
const DAY_MS = 86_400_000;

function completionBucket(days: number): CompletionBucket {
  if (days < 1) return 'under1';
  if (days <= 7) return '1to7';
  if (days <= 30) return '8to30';
  return 'over30';
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function buildInsights(
  customers: InsightCustomer[],
  now = new Date(),
  downloads: { documentId: string; userId: string; downloads: number }[] = [],
  templates: readonly string[] = [],
): AdminInsights {
  const months = Array.from({ length: MONTHS }, (_, index) =>
    monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1 - index), 1))));
  const registrations = new Map(months.map((month) => [month, 0]));
  const stopped = new Map(['1', '2', '3', '4', '5'].map((step) => [step as '1', 0]));
  const answered = { organization: 0, activity: 0, processes: 0, attention: 0 };
  const completionDays: number[] = [];
  const lists = {
    selectedSystems: [] as SelectedSystem[], sectors: [] as string[], workforceRanges: [] as string[],
    activityTypes: [] as string[], customerTypes: [] as string[], operatingAreas: [] as string[],
    processActivities: [] as string[], attentionTopics: [] as string[],
  };

  for (const customer of customers) {
    const month = monthKey(customer.createdAt);
    if (registrations.has(month)) registrations.set(month, registrations.get(month)! + 1);

    const profile = customer.profile as Partial<CustomerProfileInput> | null;
    lists.selectedSystems.push(...(strings(profile?.selectedSystems) as SelectedSystem[]));
    const sector = profile?.organization?.sector?.trim();
    if (sector) lists.sectors.push(sector);

    const { startedAt, completedAt } = customer.discovery ?? {};
    if (customer.discovery?.status === 'COMPLETED' && startedAt && completedAt) {
      completionDays.push(Math.max(0, (completedAt.getTime() - startedAt.getTime()) / DAY_MS));
    }

    if (customer.discovery?.status === 'IN_PROGRESS' && customer.discovery.currentStep <= 5) {
      const step = String(customer.discovery.currentStep) as '1';
      stopped.set(step, (stopped.get(step) ?? 0) + 1);
    }

    const context = (customer.responses['4.1'] ?? {}) as Record<string, unknown>;
    if (typeof context.workforceRange === 'string') {
      answered.organization += 1;
      lists.workforceRanges.push(context.workforceRange);
    }
    const activity = [strings(context.activityTypes), strings(context.customerTypes), strings(context.operatingAreas)];
    if (activity.some((values) => values.length)) answered.activity += 1;
    lists.activityTypes.push(...activity[0]);
    lists.customerTypes.push(...activity[1]);
    lists.operatingAreas.push(...activity[2]);

    const processes = (customer.responses['4.4'] as { processes?: Array<{ activity?: unknown }> } | undefined)?.processes ?? [];
    const activities = [...new Set(processes.map((process) => process.activity).filter((value): value is string => typeof value === 'string'))];
    if (activities.length) answered.processes += 1;
    lists.processActivities.push(...activities);

    const topics = strings((customer.responses['6.1'] as { attentionTopics?: unknown } | undefined)?.attentionTopics);
    if (topics.length) answered.attention += 1;
    lists.attentionTopics.push(...topics);
  }

  const templateCounts = new Map(templates.map((id) => [id, { count: 0, downloads: 0 }]));
  for (const row of downloads) {
    const current = templateCounts.get(row.documentId) ?? { count: 0, downloads: 0 };
    templateCounts.set(row.documentId, { count: current.count + 1, downloads: current.downloads + row.downloads });
  }

  return {
    generatedAt: now.toISOString(),
    funnel: {
      registered: customers.length,
      emailVerified: customers.filter((customer) => customer.emailVerifiedAt).length,
      discoveryStarted: customers.filter((customer) => customer.discovery).length,
      discoveryCompleted: customers.filter((customer) => customer.discovery?.status === 'COMPLETED').length,
    },
    stoppedAtStep: [...stopped].map(([value, count]) => ({ value, count })),
    registrationsByMonth: [...registrations].map(([value, count]) => ({ value, count })),
    answered,
    selectedSystems: tally(lists.selectedSystems, ['sgq', 'sga', 'sgsst'], true),
    sectors: tally(lists.sectors),
    workforceRanges: tally(lists.workforceRanges, workforceRangeSchema.options, true),
    activityTypes: tally(lists.activityTypes, activityTypeSchema.options),
    customerTypes: tally(lists.customerTypes, customerTypeSchema.options),
    operatingAreas: tally(lists.operatingAreas, operatingAreaSchema.options),
    processActivities: tally(lists.processActivities, processActivitySchema.options),
    attentionTopics: tally(lists.attentionTopics, attentionTopicSchema.options),
    completionDays: {
      // Rounded to one decimal place: a day count is what the dashboard shows.
      median: (() => { const value = median(completionDays); return value === null ? null : Math.round(value * 10) / 10; })(),
      buckets: tally(completionDays.map(completionBucket), ['under1', '1to7', '8to30', 'over30'], true),
    },
    templateDownloads: [...templateCounts]
      .map(([value, counts]) => ({ value, ...counts }))
      .sort((a, b) => b.count - a.count || b.downloads - a.downloads || a.value.localeCompare(b.value)),
  };
}
