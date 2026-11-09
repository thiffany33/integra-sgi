import { useTranslation } from 'react-i18next';
import type { SelectedSystem } from '@integra/shared/profile';

const systems: Record<SelectedSystem, { iso: string; nameKey: string }> = {
  sgq: { iso: 'ISO 9001', nameKey: 'quality' },
  sga: { iso: 'ISO 14001', nameKey: 'environment' },
  sgsst: { iso: 'ISO 45001', nameKey: 'safety' },
};

export function SelectedSystemsList({ systems: selected }: { systems: SelectedSystem[] }) {
  const { t } = useTranslation('onboarding');
  return <ul className="mt-2 space-y-1 text-base">
    {selected.map(system => <li key={system}>{t(systems[system].nameKey)} — {systems[system].iso}</li>)}
  </ul>;
}
