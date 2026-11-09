import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Trash2, UserRound } from 'lucide-react';
import { MAX_PROFILE_PHOTO_BYTES } from '@integra/shared/profile';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileApi } from '@/api/profile.api';
import { loadProfilePhoto, setProfilePhoto, useProfilePhoto } from '@/lib/profile-photo';
import { errorCode } from './error-code';
import { Feedback, ProfileGate, ProfileSubpage, type AuthenticatedContext, type Message } from './profile-shared';

function AccountSettings({ auth }: { auth: AuthenticatedContext }) {
  const { t } = useTranslation('profile');
  const [name, setName] = useState(auth.user.name);
  const [email, setEmail] = useState(auth.user.email);
  const [accountMessage, setAccountMessage] = useState<Message>(null);
  const [saving, setSaving] = useState(false);
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
    event.preventDefault(); setSaving(true); setAccountMessage(null);
    try {
      const savedUser = await auth.updateAccount({ name: name.trim(), email: email.trim().toLowerCase() });
      setName(savedUser.name); setEmail(savedUser.email);
      setAccountMessage({ kind: 'success', text: t('accountSaved') });
    } catch (error) {
      setAccountMessage({ kind: 'error', text: t(errorCode(error) === 'EMAIL_ALREADY_EXISTS' ? 'emailInUse' : errorCode(error) === 'VALIDATION_ERROR' ? 'checkFields' : 'saveError') });
    } finally { setSaving(false); }
  }

  return <ProfileSubpage title={t('accountAreaTitle')} description={t('accountAreaDescription')}>
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
      <Button type="submit" disabled={saving}>{saving ? t('saving') : t('saveAccount')}</Button>
    </form></CardContent></Card>
  </ProfileSubpage>;
}

export default function ProfileAccount() {
  return <ProfileGate returnTo="/profile/account">{auth => <AccountSettings key={auth.user.id} auth={auth} />}</ProfileGate>;
}
