import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, LockKeyhole, ShieldCheck, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/api/account.api';
import { saveFile } from '@/lib/download';
import { clearProfilePhoto } from '@/lib/profile-photo';
import { errorCode } from './error-code';
import { Feedback, ProfileGate, ProfileSubpage, type AuthenticatedContext, type Message } from './profile-shared';

function SecuritySettings({ auth }: { auth: AuthenticatedContext }) {
  const { t } = useTranslation('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<Message>(null);
  const [saving, setSaving] = useState(false);

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setPasswordMessage(null);
    try {
      await auth.changePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword('');
      setPasswordMessage({ kind: 'success', text: t('passwordSaved') });
    } catch (error) {
      setPasswordMessage({ kind: 'error', text: t(errorCode(error) === 'INVALID_CURRENT_PASSWORD' ? 'wrongCurrentPassword' : errorCode(error) === 'VALIDATION_ERROR' ? 'checkFields' : 'saveError') });
    } finally { setSaving(false); }
  }

  return <ProfileSubpage title={t('securityAreaTitle')} description={t('securityAreaDescription')}>
    <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl"><LockKeyhole className="size-6 text-primary" aria-hidden="true" />{t('passwordTitle')}</h2><p className="text-base text-muted-foreground">{t('passwordDescription')}</p></CardHeader><CardContent><form className="space-y-5" onSubmit={savePassword}>
      <div className="field"><Label htmlFor="profile-current-password">{t('currentPassword')}</Label><Input id="profile-current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required /></div>
      <div className="field"><Label htmlFor="profile-new-password">{t('newPassword')}</Label><Input id="profile-new-password" type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required minLength={12} maxLength={128} aria-describedby="profile-password-hint" /><p id="profile-password-hint" className="text-base text-muted-foreground">{t('passwordHint')}</p></div>
      <Feedback message={passwordMessage} />
      <Button type="submit" disabled={saving}>{saving ? t('saving') : t('changePassword')}</Button>
    </form></CardContent></Card>

    {/* Administrators manage customers' data from the companies page; their own account is not deleted here. */}
    {!auth.user.isAdmin && <YourData auth={auth} />}
  </ProfileSubpage>;
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
      saveFile(await accountApi.export(), 'integra-sgi-dados.json');
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
      <form className="space-y-5" onSubmit={deleteAccount}>
        <p className="text-base">{t('deleteDescription')}</p>
        <div className="field"><Label htmlFor="profile-delete-password">{t('deletePassword')}</Label><Input id="profile-delete-password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /></div>
        <label className="flex min-h-12 items-start gap-3 text-base"><input type="checkbox" className="mt-1 size-5 shrink-0 accent-destructive" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} />{t('deleteConfirm')}</label>
        <Feedback message={deleteMessage} />
        <Button type="submit" variant="destructive" disabled={deleting}><Trash2 className="mr-2 size-4" aria-hidden="true" />{deleting ? t('deleting') : t('deleteAction')}</Button>
      </form>
    </div>
  </CardContent></Card>;
}

export default function ProfileSecurity() {
  return <ProfileGate returnTo="/profile/security">{auth => <SecuritySettings key={auth.user.id} auth={auth} />}</ProfileGate>;
}
