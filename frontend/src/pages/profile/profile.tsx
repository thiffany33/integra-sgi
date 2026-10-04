import axios from 'axios';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LockKeyhole, UserRound, Building2 } from 'lucide-react';
import type { UpdateCustomerProfileInput } from '@integra/shared/auth';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, type AuthContextValue } from '@/contexts/auth-context-value';

type Organization = UpdateCustomerProfileInput['profile']['organization'];
type Representative = UpdateCustomerProfileInput['profile']['representative'];
type Message = { kind: 'success' | 'error'; text: string } | null;

function errorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  return error.response?.data?.error?.code;
}

function Feedback({ message }: { message: Message }) {
  if (!message) return null;
  return <p role={message.kind === 'success' ? 'status' : 'alert'} className={`rounded-lg border px-4 py-3 text-base ${message.kind === 'success' ? 'border-primary/30 bg-secondary/50' : 'border-destructive/50 text-destructive'}`}>{message.text}</p>;
}

type AuthenticatedContext = Extract<AuthContextValue, { status: 'authenticated' }>;

function ProfileSettings({ auth }: { auth: AuthenticatedContext }) {
  const { t } = useTranslation('profile');
  const [name, setName] = useState(auth.user.name);
  const [email, setEmail] = useState(auth.user.email);
  const [organization, setOrganization] = useState<Organization>(auth.profile.organization);
  const [representative, setRepresentative] = useState<Representative>(auth.profile.representative);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountMessage, setAccountMessage] = useState<Message>(null);
  const [organizationMessage, setOrganizationMessage] = useState<Message>(null);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);
  const [busy, setBusy] = useState<'account' | 'organization' | 'password' | null>(null);

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('account'); setAccountMessage(null);
    try {
      await auth.updateAccount({ name: name.trim(), email: email.trim().toLowerCase() });
      setAccountMessage({ kind: 'success', text: t('accountSaved') });
    } catch (error) {
      setAccountMessage({ kind: 'error', text: t(errorCode(error) === 'EMAIL_ALREADY_EXISTS' ? 'emailInUse' : errorCode(error) === 'VALIDATION_ERROR' ? 'checkFields' : 'saveError') });
    } finally { setBusy(null); }
  }

  async function saveOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('organization'); setOrganizationMessage(null);
    try {
      await auth.updateOrganization({ organization, representative });
      setOrganizationMessage({ kind: 'success', text: t('organizationSaved') });
    } catch (error) {
      setOrganizationMessage({ kind: 'error', text: t(errorCode(error) === 'PROFILE_REVISION_CONFLICT' ? 'profileConflict' : errorCode(error) === 'VALIDATION_ERROR' ? 'checkFields' : 'saveError') });
    } finally { setBusy(null); }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('password'); setPasswordMessage(null);
    try {
      await auth.changePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword('');
      setPasswordMessage({ kind: 'success', text: t('passwordSaved') });
    } catch (error) {
      setPasswordMessage({ kind: 'error', text: t(errorCode(error) === 'INVALID_CURRENT_PASSWORD' ? 'wrongCurrentPassword' : errorCode(error) === 'VALIDATION_ERROR' ? 'checkFields' : 'saveError') });
    } finally { setBusy(null); }
  }

  return <div className="mx-auto max-w-4xl space-y-8 pb-8">
    <PageHeading title={t('title')} description={t('description')} />
    <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl"><UserRound className="size-6 text-primary" aria-hidden="true" />{t('accountTitle')}</h2><p className="text-base text-muted-foreground">{t('accountDescription')}</p></CardHeader><CardContent><form className="space-y-5" onSubmit={saveAccount}>
      <div className="field"><Label htmlFor="profile-account-name">{t('accountName')}</Label><Input id="profile-account-name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required maxLength={160} /></div>
      <div className="field"><Label htmlFor="profile-account-email">{t('accountEmail')}</Label><Input id="profile-account-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} /></div>
      <p className="text-base text-muted-foreground">{t('emailVerificationHint')}</p>
      <Feedback message={accountMessage} />
      <Button type="submit" disabled={busy !== null}>{busy === 'account' ? t('saving') : t('saveAccount')}</Button>
    </form></CardContent></Card>

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
      <p className="text-base text-muted-foreground">{t('systemsManagedByAdmin')}</p>
      <Feedback message={organizationMessage} />
      <Button type="submit" disabled={busy !== null}>{busy === 'organization' ? t('saving') : t('saveOrganization')}</Button>
    </form></CardContent></Card>

    <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl"><LockKeyhole className="size-6 text-primary" aria-hidden="true" />{t('passwordTitle')}</h2><p className="text-base text-muted-foreground">{t('passwordDescription')}</p></CardHeader><CardContent><form className="space-y-5" onSubmit={savePassword}>
      <div className="field"><Label htmlFor="profile-current-password">{t('currentPassword')}</Label><Input id="profile-current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required /></div>
      <div className="field"><Label htmlFor="profile-new-password">{t('newPassword')}</Label><Input id="profile-new-password" type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required minLength={12} maxLength={128} aria-describedby="profile-password-hint" /><p id="profile-password-hint" className="text-base text-muted-foreground">{t('passwordHint')}</p></div>
      <Feedback message={passwordMessage} />
      <Button type="submit" disabled={busy !== null}>{busy === 'password' ? t('saving') : t('changePassword')}</Button>
    </form></CardContent></Card>
  </div>;
}

export default function Profile() {
  const auth = useAuth();
  const { t } = useTranslation('profile');
  if (auth.status === 'loading') return <p role="status">{t('loading')}</p>;
  if (auth.status !== 'authenticated') return <div className="mx-auto max-w-2xl"><PageHeading title={t('title')} description={t('signInRequired')} /><Button asChild><Link to="/login?returnTo=%2Fprofile">{t('signIn')}</Link></Button></div>;
  return <ProfileSettings key={auth.user.id} auth={auth} />;
}
