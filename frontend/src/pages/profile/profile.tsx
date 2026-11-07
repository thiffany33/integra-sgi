import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LockKeyhole, UserRound, Building2, Camera, Trash2, Download, ShieldCheck } from 'lucide-react';
import type { UpdateCustomerProfileInput } from '@integra/shared/auth';
import { MAX_PROFILE_PHOTO_BYTES } from '@integra/shared/profile';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, type AuthContextValue } from '@/contexts/auth-context-value';
import { profileApi } from '@/api/profile.api';
import { accountApi } from '@/api/account.api';
import { clearProfilePhoto, loadProfilePhoto, setProfilePhoto, useProfilePhoto } from '@/lib/profile-photo';

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
  const [hasProfileConflict, setHasProfileConflict] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);
  const [busy, setBusy] = useState<'account' | 'organization' | 'password' | null>(null);
  const photoUrl = useProfilePhoto();
  const [photoMessage, setPhotoMessage] = useState<Message>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  useEffect(() => {
    let active = true;
    loadProfilePhoto(auth.user.id, { fresh: true })
      .catch(() => { if (active) setPhotoMessage({ kind: 'error', text: t('photoLoadError') }); });
    return () => { active = false; };
  }, [t, auth.user.id]);

  async function uploadPhoto(file: File | undefined, input: HTMLInputElement) {
    if (!file) return;
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      input.value = '';
      setPhotoMessage({ kind: 'error', text: t('photoUploadError') });
      return;
    }
    setPhotoBusy(true); setPhotoMessage(null);
    try {
      const url = await profileApi.uploadPhoto(file);
      setProfilePhoto(auth.user.id, url);
      setPhotoMessage({ kind: 'success', text: t('photoSaved') });
    } catch (error) {
      const code = errorCode(error);
      const tooLarge = axios.isAxiosError(error) && error.response?.status === 413;
      const message = code === 'INVALID_PROFILE_PHOTO' || tooLarge ? 'photoUploadError'
        : code === 'PROFILE_PHOTO_STORAGE_UNAVAILABLE' ? 'photoStorageError'
          : 'photoSaveError';
      setPhotoMessage({ kind: 'error', text: t(message) });
    } finally {
      input.value = '';
      setPhotoBusy(false);
    }
  }

  async function removePhoto() {
    setPhotoBusy(true); setPhotoMessage(null);
    try {
      await profileApi.removePhoto(); setProfilePhoto(auth.user.id, null);
      setPhotoMessage({ kind: 'success', text: t('photoRemoved') });
    } catch { setPhotoMessage({ kind: 'error', text: t('photoRemoveError') }); }
    finally { setPhotoBusy(false); }
  }

  async function saveAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('account'); setAccountMessage(null);
    try {
      const savedUser = await auth.updateAccount({ name: name.trim(), email: email.trim().toLowerCase() });
      setName(savedUser.name); setEmail(savedUser.email);
      setAccountMessage({ kind: 'success', text: t('accountSaved') });
    } catch (error) {
      setAccountMessage({ kind: 'error', text: t(errorCode(error) === 'EMAIL_ALREADY_EXISTS' ? 'emailInUse' : errorCode(error) === 'VALIDATION_ERROR' ? 'checkFields' : 'saveError') });
    } finally { setBusy(null); }
  }

  async function saveOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy('organization'); setOrganizationMessage(null); setHasProfileConflict(false);
    try {
      const saved = await auth.updateOrganization({ organization, representative });
      setOrganization(saved.profile.organization); setRepresentative(saved.profile.representative);
      setOrganizationMessage({ kind: 'success', text: t('organizationSaved') });
    } catch (error) {
      setHasProfileConflict(errorCode(error) === 'PROFILE_REVISION_CONFLICT');
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
    <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl"><Camera className="size-6 text-primary" aria-hidden="true" />{t('photoTitle')}</h2><p className="text-base text-muted-foreground">{t('photoDescription')}</p></CardHeader><CardContent>
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {photoUrl ? <img src={photoUrl} alt={t('photoTitle')} className="size-24 rounded-full border object-cover" /> : <div aria-hidden="true" className="flex size-24 items-center justify-center rounded-full bg-secondary text-primary"><UserRound className="size-10" /></div>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Label htmlFor="profile-photo-upload" className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground hover:bg-primary/90">{photoBusy ? t('photoSaving') : t('choosePhoto')}</Label>
          <Input id="profile-photo-upload" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label={t('choosePhoto')} disabled={photoBusy} onChange={event => void uploadPhoto(event.currentTarget.files?.[0], event.currentTarget)} />
          {photoUrl && <Button type="button" variant="outline" disabled={photoBusy} onClick={() => void removePhoto()}><Trash2 className="mr-2 size-4" aria-hidden="true" />{t('removePhoto')}</Button>}
        </div>
      </div>
      <p className="mt-3 text-base text-muted-foreground">{t('photoLimit')}</p><div className="mt-4"><Feedback message={photoMessage} /></div>
    </CardContent></Card>
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
      {hasProfileConflict && <Button type="button" variant="outline" onClick={() => window.location.reload()}>{t('reloadProfile')}</Button>}
      <Button type="submit" disabled={busy !== null}>{busy === 'organization' ? t('saving') : t('saveOrganization')}</Button>
    </form></CardContent></Card>

    <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl"><LockKeyhole className="size-6 text-primary" aria-hidden="true" />{t('passwordTitle')}</h2><p className="text-base text-muted-foreground">{t('passwordDescription')}</p></CardHeader><CardContent><form className="space-y-5" onSubmit={savePassword}>
      <div className="field"><Label htmlFor="profile-current-password">{t('currentPassword')}</Label><Input id="profile-current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required /></div>
      <div className="field"><Label htmlFor="profile-new-password">{t('newPassword')}</Label><Input id="profile-new-password" type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required minLength={12} maxLength={128} aria-describedby="profile-password-hint" /><p id="profile-password-hint" className="text-base text-muted-foreground">{t('passwordHint')}</p></div>
      <Feedback message={passwordMessage} />
      <Button type="submit" disabled={busy !== null}>{busy === 'password' ? t('saving') : t('changePassword')}</Button>
    </form></CardContent></Card>

    <YourData auth={auth} />
  </div>;
}

/** Data portability and erasure, as promised by the privacy policy. */
function YourData({ auth }: { auth: AuthenticatedContext }) {
  const { t } = useTranslation(['profile', 'common']);
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<Message>(null);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<Message>(null);

  async function exportData() {
    setExporting(true); setExportMessage(null);
    try {
      const url = URL.createObjectURL(await accountApi.export());
      const link = document.createElement('a');
      link.href = url;
      link.download = 'integra-sgi-dados.json';
      link.click();
      URL.revokeObjectURL(url);
      setExportMessage({ kind: 'success', text: t('exportReady') });
    } catch {
      setExportMessage({ kind: 'error', text: t('exportError') });
    } finally { setExporting(false); }
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmed) { setDeleteMessage({ kind: 'error', text: t('deleteConfirmRequired') }); return; }
    setDeleting(true); setDeleteMessage(null);
    try {
      await auth.deleteAccount(password, () => {
        clearProfilePhoto();
        navigate('/login', { replace: true, state: { signingOut: true, accountDeleted: true } });
      });
    } catch (error) {
      const code = errorCode(error);
      setDeleteMessage({ kind: 'error', text: t(code === 'INVALID_CURRENT_PASSWORD' ? 'wrongCurrentPassword' : code === 'RATE_LIMITED' ? 'deleteRateLimited' : 'deleteError') });
      setDeleting(false);
    }
  }

  return <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl"><ShieldCheck className="size-6 text-primary" aria-hidden="true" />{t('dataTitle')}</h2><p className="text-base text-muted-foreground">{t('dataDescription')} <Link className="text-link" to="/privacidade">{t('common:privacyPolicy')}</Link></p></CardHeader><CardContent className="space-y-8">
    <div className="space-y-3">
      <h3 className="text-xl">{t('exportTitle')}</h3>
      <p className="text-base text-muted-foreground">{t('exportDescription')}</p>
      <Feedback message={exportMessage} />
      <Button type="button" variant="outline" disabled={exporting} onClick={() => void exportData()}><Download className="mr-2 size-4" aria-hidden="true" />{exporting ? t('exporting') : t('exportAction')}</Button>
    </div>
    <div className="space-y-3 border-t pt-6">
      <h3 className="text-xl">{t('deleteTitle')}</h3>
      {auth.user.isAdmin ? <p className="text-base text-muted-foreground">{t('deleteAdminBlocked')}</p> : <form className="space-y-5" onSubmit={deleteAccount}>
        <p className="text-base">{t('deleteDescription')}</p>
        <div className="field"><Label htmlFor="profile-delete-password">{t('deletePassword')}</Label><Input id="profile-delete-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></div>
        <label className="flex min-h-12 items-start gap-3 text-base"><input type="checkbox" className="mt-1 size-5 shrink-0 accent-destructive" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />{t('deleteConfirm')}</label>
        <Feedback message={deleteMessage} />
        <Button type="submit" variant="destructive" disabled={deleting}><Trash2 className="mr-2 size-4" aria-hidden="true" />{deleting ? t('deleting') : t('deleteAction')}</Button>
      </form>}
    </div>
  </CardContent></Card>;
}

export default function Profile() {
  const auth = useAuth();
  const { t } = useTranslation('profile');
  if (auth.status === 'loading') return <p role="status">{t('loading')}</p>;
  if (auth.status !== 'authenticated') return <div className="mx-auto max-w-2xl"><PageHeading title={t('title')} description={t('signInRequired')} /><Button asChild><Link to="/login?returnTo=%2Fprofile">{t('signIn')}</Link></Button></div>;
  return <ProfileSettings key={auth.user.id} auth={auth} />;
}
