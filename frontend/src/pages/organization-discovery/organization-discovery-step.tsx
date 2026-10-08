import type { CustomerProfileInput } from '@integra/shared/profile';
import type { DiscoveryAnswers } from '@/api/organization-discovery.api';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Step = 1 | 2 | 3 | 4 | 5;
type Props = { step: Step; answers: DiscoveryAnswers; profile: CustomerProfileInput; onChange: (answers: DiscoveryAnswers) => void; onNext: () => void; onBack: () => void; onLeave: () => void; busy: boolean };
const choices = {
  activityTypes: [['services', 'services'], ['production', 'production'], ['trade', 'trade'], ['construction', 'construction'], ['other', 'other']],
  customerTypes: [['consumers', 'consumers'], ['businesses', 'businesses'], ['public_sector', 'publicSector'], ['other', 'other']],
  operatingAreas: [['local', 'local'], ['national', 'national'], ['international', 'international']],
  attentionTopics: [['complaints', 'complaints'], ['delays', 'delays'], ['service_errors', 'serviceErrors'], ['incidents', 'incidents'], ['material_shortages', 'materialShortages'], ['training_needs', 'trainingNeeds'], ['other', 'other']],
} as const;
const processes = [['sales', 'sales'], ['purchasing', 'purchasing'], ['production', 'production'], ['service_delivery', 'serviceDelivery'], ['customer_support', 'customerSupport'], ['administration', 'administration'], ['other', 'other']] as const;
const roles = [['management', 'responsibleManagement'], ['quality', 'responsibleQuality'], ['environment', 'responsibleEnvironment'], ['safety', 'responsibleSafety']] as const;

export function OrganizationDiscoveryStep({ step, answers, profile, onChange, onNext, onBack, onLeave, busy }: Props) {
  const { t } = useTranslation('organizationDiscovery');
  const set = <T extends Step>(number: T, answer: DiscoveryAnswers[T]) => onChange({ ...answers, [number]: answer });
  const text = (id: string, label: string, value: string, change: (value: string) => void, hint?: string, maxLength = 1000) => <div className="field" key={id}><Label htmlFor={id}>{t(label)} <span className="font-normal text-muted-foreground">({t('optional')})</span></Label><Input id={id} value={value} onChange={event => change(event.target.value)} placeholder={hint ? t(hint) : undefined} maxLength={maxLength} className="min-h-14" /></div>;
  const select = (id: string, label: string, value: string, options: readonly (readonly [string, string])[], change: (value: string) => void) => <div className="field"><Label htmlFor={id}>{t(label)} <span className="font-normal text-muted-foreground">({t('optional')})</span></Label><select id={id} value={value} onChange={event => change(event.target.value)} className="min-h-14 w-full rounded-md border border-input bg-background px-3 text-base focus-visible:ring-3 focus-visible:ring-ring/50"><option value="">{t('selectOption')}</option>{options.map(([value, key]) => <option value={value} key={value}>{t(key)}</option>)}</select></div>;
  const checkGroup = (id: keyof typeof choices, selected: readonly string[], change: (value: string[]) => void) => <fieldset className="space-y-3"><legend className="mb-3 text-base font-semibold">{t(id)} <span className="font-normal text-muted-foreground">({t('optional')})</span></legend><div className="grid gap-2 sm:grid-cols-2">{choices[id].map(([value, key]) => <label key={value} className="flex min-h-12 items-center gap-3 rounded-lg border bg-card px-4 py-2 text-base"><input type="checkbox" value={value} checked={selected.includes(value)} onChange={event => change(event.target.checked ? [...selected, value] : selected.filter(item => item !== value))} className="size-5 accent-primary" />{t(key)}</label>)}</div></fieldset>;

  return <section className="mx-auto max-w-3xl space-y-8 py-6">
    <div className="space-y-4"><p className="eyebrow">{t('step', { number: step })}</p><div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={6} aria-label={t('step', { number: step })}><div className="h-full rounded-full bg-primary" style={{ width: `${step / 6 * 100}%` }} /></div><h1>{t(`step${step}Title`)}</h1><p className="text-lg text-muted-foreground">{t(`step${step}Intro`)}</p></div>
    <form onSubmit={event => { event.preventDefault(); onNext(); }} className="space-y-8">
      {step === 1 && <>
        <section className="rounded-xl border bg-secondary/40 p-5"><h2 className="mb-4">{t('profileHeading')}</h2><dl className="grid gap-3 sm:grid-cols-2">{([['organizationName', profile.organization.name], ['taxId', profile.organization.nif], ['sector', profile.organization.sector], ['contactEmail', profile.organization.email]] as const).map(([key, value]) => <div key={key}><dt className="text-base font-semibold">{t(key)}</dt><dd className="text-base">{value}</dd></div>)}</dl></section>
        {select('team-size', 'teamSize', answers[1].workforceRange ?? '', [['1-9', 'range1'], ['10-49', 'range2'], ['50-249', 'range3'], ['250+', 'range4']], value => set(1, { ...answers[1], workforceRange: value ? value as DiscoveryAnswers[1]['workforceRange'] : undefined }))}
        {select('work-location', 'workLocation', answers[1].workLocation ?? '', [['on_site', 'onSite'], ['remote', 'remote'], ['hybrid', 'hybrid'], ['multiple_sites', 'multipleSites']], value => set(1, { ...answers[1], workLocation: value ? value as DiscoveryAnswers[1]['workLocation'] : undefined }))}
        {text('primary-location', 'primaryLocation', answers[1].primaryLocation ?? '', value => set(1, { ...answers[1], primaryLocation: value }), 'locationExample', 120)}
        <div className="field"><Label htmlFor="years">{t('yearsInOperation')} <span className="font-normal text-muted-foreground">({t('optional')})</span></Label><Input id="years" type="number" min={0} max={200} step={1} className="min-h-14" value={answers[1].yearsInOperation ?? ''} onChange={event => set(1, { ...answers[1], yearsInOperation: event.target.value === '' ? undefined : Number(event.target.value) })} /><p className="field-hint">{t('yearsExample')}</p></div>
      </>}
      {step === 2 && <>
        {checkGroup('activityTypes', answers[2].activityTypes ?? [], values => set(2, { ...answers[2], activityTypes: values as DiscoveryAnswers[2]['activityTypes'] }))}
        {checkGroup('customerTypes', answers[2].customerTypes ?? [], values => set(2, { ...answers[2], customerTypes: values as DiscoveryAnswers[2]['customerTypes'] }))}
        {checkGroup('operatingAreas', answers[2].operatingAreas ?? [], values => set(2, { ...answers[2], operatingAreas: values as DiscoveryAnswers[2]['operatingAreas'] }))}
        <div className="field"><Label htmlFor="activity-description">{t('activityDescription')} <span className="font-normal text-muted-foreground">({t('optional')})</span></Label><Textarea id="activity-description" className="min-h-28" maxLength={1000} value={answers[2].activityDescription ?? ''} onChange={event => set(2, { ...answers[2], activityDescription: event.target.value })} placeholder={t('activityExample')} /></div>
      </>}
      {step === 3 && <>
        {roles.map(([role, key]) => text(`responsible-${role}`, key, answers[3].responsibilityAssignments?.find(item => item.role === role)?.personName ?? '', value => {
          const remaining = (answers[3].responsibilityAssignments ?? []).filter(item => item.role !== role);
          set(3, { ...answers[3], responsibilityAssignments: value.trim() ? [...remaining, { role, personName: value }] : remaining });
        }, 'personExample', 160))}
        <div className="space-y-4"><h2>{t('additionalPeople')}</h2>{(answers[3].additionalPeople ?? []).map((person, index) => <div key={index} className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
          <div className="field"><Label htmlFor={`person-name-${index}`}>{t('personName')}</Label><Input id={`person-name-${index}`} className="min-h-14" maxLength={160} value={person.name} onChange={event => set(3, { ...answers[3], additionalPeople: answers[3].additionalPeople?.map((entry, position) => position === index ? { ...entry, name: event.target.value } : entry) })} placeholder={t('personExample')} required /></div>
          <div className="field"><Label htmlFor={`person-role-${index}`}>{t('personRole')}</Label><Input id={`person-role-${index}`} className="min-h-14" maxLength={120} value={person.role} onChange={event => set(3, { ...answers[3], additionalPeople: answers[3].additionalPeople?.map((entry, position) => position === index ? { ...entry, role: event.target.value } : entry) })} placeholder={t('roleExample')} required /></div>
          <Button type="button" variant="outline" className="sm:col-span-2 sm:justify-self-start" onClick={() => set(3, { ...answers[3], additionalPeople: answers[3].additionalPeople?.filter((_, position) => position !== index) })}>{t('removePerson')}</Button>
        </div>)}<Button type="button" variant="outline" disabled={(answers[3].additionalPeople?.length ?? 0) >= 20} onClick={() => set(3, { ...answers[3], additionalPeople: [...(answers[3].additionalPeople ?? []), { name: '', role: '' }] })}>{t('addPerson')}</Button></div>
      </>}
      {step === 4 && <fieldset className="space-y-4"><legend className="text-base font-semibold">{t('commonActivities')} <span className="font-normal text-muted-foreground">({t('optional')})</span></legend>{processes.map(([activity, key]) => {
        const current = answers[4].processes?.find(item => item.activity === activity);
        return <div key={activity} className="rounded-xl border bg-card p-4"><label className="flex min-h-12 items-center gap-3 text-base font-medium"><input type="checkbox" className="size-5 accent-primary" checked={Boolean(current)} onChange={event => set(4, { ...answers[4], processes: event.target.checked ? [...(answers[4].processes ?? []), { activity }] : answers[4].processes?.filter(item => item.activity !== activity) })} />{t(key)}</label>{current && <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {activity === 'other' && <div className="field sm:col-span-2"><Label htmlFor="custom-activity">{t('customActivity')}</Label><Input id="custom-activity" className="min-h-14" maxLength={160} value={current.customName ?? ''} placeholder={t('customExample')} onChange={event => set(4, { ...answers[4], processes: answers[4].processes?.map(item => item.activity === activity ? { ...item, customName: event.target.value } : item) })} /></div>}
          {text(`owner-${activity}`, 'processOwner', current.owner ?? '', value => set(4, { ...answers[4], processes: answers[4].processes?.map(item => item.activity === activity ? { ...item, owner: value } : item) }), undefined, 160)}
          {select(`frequency-${activity}`, 'frequency', current.frequency ?? '', [['daily', 'daily'], ['weekly', 'weekly'], ['monthly', 'monthly'], ['occasionally', 'occasionally']], value => set(4, { ...answers[4], processes: answers[4].processes?.map(item => item.activity === activity ? { ...item, frequency: value ? value as NonNullable<DiscoveryAnswers[4]['processes']>[number]['frequency'] : undefined } : item) }))}
        </div>}</div>;
      })}</fieldset>}
      {step === 5 && <>{checkGroup('attentionTopics', answers[5].attentionTopics ?? [], values => set(5, { ...answers[5], attentionTopics: values as DiscoveryAnswers[5]['attentionTopics'] }))}<div className="field"><Label htmlFor="notes">{t('notes')} <span className="font-normal text-muted-foreground">({t('optional')})</span></Label><Textarea id="notes" className="min-h-28" maxLength={1000} value={answers[5].notes ?? ''} onChange={event => set(5, { ...answers[5], notes: event.target.value })} placeholder={t('notesExample')} /></div></>}
      <p className="field-hint">{t('choose')}</p>
      <div className="form-actions"><div className="flex flex-wrap gap-3"><Button type="button" variant="outline" onClick={onBack} disabled={busy}>{t('back')}</Button><Button type="button" variant="outline" onClick={onLeave} disabled={busy}>{t('saveLeave')}</Button></div><Button type="submit" size="lg" disabled={busy}>{busy ? t('saving') : t('continue')}</Button></div>
    </form>
  </section>;
}
