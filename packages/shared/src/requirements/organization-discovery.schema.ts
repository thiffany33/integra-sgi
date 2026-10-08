import { z } from 'zod';

const optionalText = (maximum: number) => z.string().trim().max(maximum).optional();
const uniqueChoices = <T extends z.ZodEnum>(choice: T, maximum: number) =>
  z.array(choice).max(maximum).refine((values) => new Set(values).size === values.length, {
    message: 'Choose each option only once.',
  });

export const workforceRangeSchema = z.enum(['1-9', '10-49', '50-249', '250+']);
export const workLocationSchema = z.enum(['on_site', 'remote', 'hybrid', 'multiple_sites']);
export const activityTypeSchema = z.enum(['services', 'production', 'trade', 'construction', 'other']);
export const customerTypeSchema = z.enum(['consumers', 'businesses', 'public_sector', 'other']);
export const operatingAreaSchema = z.enum(['local', 'national', 'international']);
export const responsibilityRoleSchema = z.enum(['management', 'quality', 'environment', 'safety']);
export const processActivitySchema = z.enum(['sales', 'purchasing', 'production', 'service_delivery', 'customer_support', 'administration', 'other']);
export const processFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'occasionally']);
export const attentionTopicSchema = z.enum(['complaints', 'delays', 'service_errors', 'incidents', 'material_shortages', 'training_needs', 'other']);

const organizationContextShape = {
  workforceRange: workforceRangeSchema.optional(),
  workLocation: workLocationSchema.optional(),
  primaryLocation: optionalText(120),
  yearsInOperation: z.number().int().min(0).max(200).optional(),
};

const activityContextShape = {
  activityTypes: uniqueChoices(activityTypeSchema, 5).optional(),
  customerTypes: uniqueChoices(customerTypeSchema, 4).optional(),
  operatingAreas: uniqueChoices(operatingAreaSchema, 3).optional(),
  activityDescription: optionalText(1000),
};

const peopleShape = {
  responsibilityAssignments: z.array(z.object({
    role: responsibilityRoleSchema,
    personName: z.string().trim().min(1).max(160),
  }).strict()).max(10).optional(),
  additionalPeople: z.array(z.object({
    name: z.string().trim().min(1).max(160),
    role: z.string().trim().min(1).max(120),
  }).strict()).max(20).optional(),
};

const processesShape = {
  processes: z.array(z.object({
    activity: processActivitySchema,
    customName: optionalText(160),
    owner: optionalText(160),
    frequency: processFrequencySchema.optional(),
  }).strict()).max(20).optional(),
};

const attentionShape = {
  attentionTopics: uniqueChoices(attentionTopicSchema, 7).optional(),
  notes: optionalText(1000),
};

export const organizationDiscoveryStep1AnswersSchema = z.object(organizationContextShape).strict();
export const organizationDiscoveryStep2AnswersSchema = z.object(activityContextShape).strict();
export const organizationDiscoveryStep3AnswersSchema = z.object(peopleShape).strict();
export const organizationDiscoveryStep4AnswersSchema = z.object(processesShape).strict();
export const organizationDiscoveryStep5AnswersSchema = z.object(attentionShape).strict();

export const organizationDiscoveryResponseSchemas = {
  '4.1': z.object({ ...organizationContextShape, ...activityContextShape }).strict(),
  '4.2': organizationDiscoveryStep3AnswersSchema,
  '4.4': organizationDiscoveryStep4AnswersSchema,
  '6.1': organizationDiscoveryStep5AnswersSchema,
} as const;

export const organizationDiscoveryStepNumberSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
]);

export const organizationDiscoveryRequirementCodeByStep = {
  1: '4.1',
  2: '4.1',
  3: '4.2',
  4: '4.4',
  5: '6.1',
} as const;

const saveSchema = <T extends z.ZodType>(answers: T) => z.object({
  revision: z.number().int().min(0),
  answers,
}).strict();

export const organizationDiscoverySaveSchemas = {
  1: saveSchema(organizationDiscoveryStep1AnswersSchema),
  2: saveSchema(organizationDiscoveryStep2AnswersSchema),
  3: saveSchema(organizationDiscoveryStep3AnswersSchema),
  4: saveSchema(organizationDiscoveryStep4AnswersSchema),
  5: saveSchema(organizationDiscoveryStep5AnswersSchema),
} as const;

export function getOrganizationDiscoverySaveSchema(step: number) {
  const parsed = organizationDiscoveryStepNumberSchema.safeParse(step);
  return parsed.success ? organizationDiscoverySaveSchemas[parsed.data] : undefined;
}

export type OrganizationDiscoverySaveStep = z.infer<typeof organizationDiscoveryStepNumberSchema>;
export type OrganizationDiscoveryRequirementCode = keyof typeof organizationDiscoveryResponseSchemas;
export type OrganizationDiscoveryStep1Answers = z.infer<typeof organizationDiscoveryStep1AnswersSchema>;
export type OrganizationDiscoveryStep2Answers = z.infer<typeof organizationDiscoveryStep2AnswersSchema>;
export type OrganizationDiscoveryStep3Answers = z.infer<typeof organizationDiscoveryStep3AnswersSchema>;
export type OrganizationDiscoveryStep4Answers = z.infer<typeof organizationDiscoveryStep4AnswersSchema>;
export type OrganizationDiscoveryStep5Answers = z.infer<typeof organizationDiscoveryStep5AnswersSchema>;
export type OrganizationDiscoverySavePayload = z.infer<(typeof organizationDiscoverySaveSchemas)[OrganizationDiscoverySaveStep]>;
export type OrganizationDiscoveryResponses = {
  [K in OrganizationDiscoveryRequirementCode]?: z.infer<(typeof organizationDiscoveryResponseSchemas)[K]>;
};

export interface OrganizationDiscoveryState {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  currentStep: 1 | 2 | 3 | 4 | 5 | 6;
  completedSteps: Array<1 | 2 | 3 | 4 | 5 | 6>;
  revision: number;
  responses: OrganizationDiscoveryResponses;
}
