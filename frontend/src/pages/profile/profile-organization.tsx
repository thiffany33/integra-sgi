import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';
import type { UpdateCustomerProfileInput } from '@integra/shared/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { errorCode } from './error-code';
import { Feedback, ProfileGate, ProfileSubpage, type AuthenticatedContext, type Message } from './profile-shared';
import { SelectedSystemsList } from './selected-systems';

type Organization = UpdateCustomerProfileInput['profile']['organization'];
type Representative = UpdateCustomerProfileInput['profile']['representative'];

function OrganizationSettings({ auth }: { auth: AuthenticatedContext }) {
  const { t } = useTranslation('profile');
  const [organization, setOrganization] = useState<Organization>(auth.profile.organization);
  const [representative, setRepresentative] = useState<Representative>(auth.profile.representative);
  const [message, setMessage] = useState<Message>(null);
  const [hasProfileConflict, setHasProfileConflict] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(null); setHasProfileConflict(false);
    try {
      const saved = await auth.updateOrganization({ organization, representative });
      setOrganization(saved.profile.organization); setRepresentative(saved.profile.representative);
      setMessage({ kind: 'success', text: t('organizationSaved') });
    } catch (error) {
      setHasProfileConflict(errorCode(error) === 'PROFILE_REVISION_CONFLICT');
      setMessage({ kind: 'error', text: t(errorCode(error) === 'PROFILE_REVISION_CONFLICT' ? 'profileConflict' : errorCode(error) === 'VALIDATION_ERROR' ? 'checkFields' : 'saveError') });
    } finally { setSaving(false); }
  }

  return <ProfileSubpage title={t('organizationAreaTitle')} description={t('organizationAreaDescription')}>
    <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl"><Building2 className="size-6 text-primary" aria-hidden="true" />{t('organizationTitle')}</h2><p className="text-base text-muted-foreground">{t('organizationDescription')}</p></CardHeader><CardContent><form className="space-y-5" onSubmit={saveOrganization}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field sm:col-span-2"><Label htmlFor="profile-organization-name">{t('organizationName')}</Label><Input id="profile-organization-name" value={organization.name} onChange={event => setOrganization({ ...organization, name: event.target.value })} required maxLength={160} autoComplete="organization" /></div>
        <div className="field"><Label htmlFor="profile-organization-nif">{t('organizationNif')}</Label><Input id="profile-organization-nif" value={organization.nif} onChange={event => setOrganization({ ...organization, nif: event.target.value })} required maxLength={32} /></div>
        <div className="field"><Label htmlFor="profile-organization-sector">{t('organizationSector')}</Label><Input id="profile-organization-sector" value={organization.sector} onChange={event => setOrganization({ ...organization, sector: event.target.value })} required maxLength={100} /></div>
        <div className="field sm:col-span-2"><Label htmlFor="profile-organization-email">{t('organizationEmail')}</Label><Input id="profile-organization-email" type="email" value={organization.email} onChange={event => setOrganization({ ...organization, email: event.target.value })} required maxLength={254} /></div>
      </div>
      <h3 className="border-t pt-5 text-xl">{t('representativeTitle')}</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field sm:col-span-2"><Label htmlFor="profile-representative-name">{t('representativeName')}</Label><Input id="profile-representative-name" value={representative.name} onChange={event => setRepresentative({ ...representative, name: event.target.value })} required maxLength={160} /></div>
        <div className="field"><Label htmlFor="profile-representative-email">{t('representativeEmail')}</Label><Input id="profile-representative-email" type="email" value={representative.email} onChange={event => setRepresentative({ ...representative, email: event.target.value })} maxLength={254} /></div>
        <div className="field"><Label htmlFor="profile-representative-phone">{t('representativePhone')}</Label><Input id="profile-representative-phone" type="tel" value={representative.phone} onChange={event => setRepresentative({ ...representative, phone: event.target.value })} maxLength={40} /></div>
      </div>
      {/* Read-only here: shown as text, since only the administration changes them. */}
      <div className="border-t pt-5"><h3 className="text-xl">{t('selectedSystemsTitle')}</h3><SelectedSystemsList systems={auth.profile.selectedSystems} /><p className="mt-2 text-base text-muted-foreground">{t('systemsManagedByAdmin')}</p></div>
      <Feedback message={message} />
      {hasProfileConflict && <Button type="button" variant="outline" onClick={() => window.location.reload()}>{t('reloadProfile')}</Button>}
      <Button type="submit" disabled={saving}>{saving ? t('saving') : t('saveOrganization')}</Button>
    </form></CardContent></Card>
  </ProfileSubpage>;
}

export default function ProfileOrganization() {
  return <ProfileGate returnTo="/profile/organization">{auth => <OrganizationSettings key={auth.user.id} auth={auth} />}</ProfileGate>;
}
