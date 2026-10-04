const knownRequirementPaths = new Set([
  '/dashboard', '/profile', '/downloads', '/requirement4', '/requirement4_1', '/requirement4_2', '/requirement4_3', '/requirement4_4',
  '/requirement5', '/requirement5_1', '/requirement5_2', '/requirement5_3', '/requirement5_4',
  '/requirement6', '/requirement6_1_quality', '/requirement6_1_environment', '/requirement6_1_sst', '/requirement6_2',
  '/requirement7', '/requirement7_1', '/requirement7_2', '/requirement7_3', '/requirement7_4', '/requirement7_5',
]);

export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/dashboard';
  if (knownRequirementPaths.has(value)) return value;
  return '/dashboard';
}
