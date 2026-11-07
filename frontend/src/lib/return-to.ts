const knownPaths = new Set([
  '/dashboard',
  '/organization-discovery',
  '/profile',
  '/downloads',
  '/admin/customers',
  '/admin/insights',
  '/requirement',
  '/contact',
  '/representative',
  '/select-systems',
  // Requisito 4
  '/requirement4', '/requirement4_1', '/requirement4_2', '/requirement4_3', '/requirement4_4',
  // Requisito 5
  '/requirement5', '/requirement5_1', '/requirement5_2', '/requirement5_3', '/requirement5_4',
  // Requisito 6
  '/requirement6', '/requirement6_1_quality', '/requirement6_1_environment', '/requirement6_1_sst', '/requirement6_2',
  // Requisito 7
  '/requirement7', '/requirement7_1', '/requirement7_2', '/requirement7_3', '/requirement7_4', '/requirement7_5',
  // Requisito 8
  '/requirement8', '/requirement8_1', '/requirement8_2', '/requirement8_3', '/requirement8_4', '/requirement8_5', '/requirement8_6', '/requirement8_7', '/requirement8_8', '/requirement8_9',
  // Requisito 9
  '/requirement9', '/requirement9_1', '/requirement9_2', '/requirement9_3',
  // Requisito 10
  '/requirement10', '/requirement10_1', '/requirement10_2',
]);

export function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/dashboard';
  const [pathname] = value.split(/[?#]/);
  if (knownPaths.has(pathname)) return value;
  return '/dashboard';
}
