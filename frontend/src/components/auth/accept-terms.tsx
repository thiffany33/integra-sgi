import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context-value';
import { PRIVACY_CONTACT } from '@/lib/legal';

/** Shown instead of a signed-in page until the account accepts the current Terms of Use. */
export function AcceptTerms() {
  const auth = useAuth();
  const { t } = useTranslation('common');
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  async function accept() {
    setSaving(true); setError(false);
    try { await auth.acceptTerms(); } catch { setError(true); } finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-2xl space-y-6">
    <PageHeading title={t('termsGateTitle')} description={t('termsGateBody')} />
    <p className="text-base"><Link className="text-link" to="/termos" target="_blank" rel="noopener noreferrer">{t('readTerms')}<span className="sr-only"> {t('opensInNewTab')}</span></Link></p>
    <form className="space-y-4" onSubmit={event => { event.preventDefault(); void accept(); }}>
      <label className="flex min-h-12 items-start gap-3 rounded-lg border px-4 py-3 text-base">
        <input type="checkbox" required className="mt-1 size-5 shrink-0 accent-primary" checked={accepted} onChange={event => setAccepted(event.target.checked)} disabled={saving} />
        <span>{t('acceptTermsLabel')}</span>
      </label>
      {error && <p role="alert" className="text-base text-destructive">{t('termsGateError')}</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>{saving ? t('termsGateSaving') : t('termsGateAccept')}</Button>
        <Button type="button" variant="outline" disabled={saving} onClick={() => void auth.logout()}>{t('termsGateLogout')}</Button>
      </div>
    </form>
    <p className="text-base text-muted-foreground">{t('termsGateDecline', { email: PRIVACY_CONTACT.email })}</p>
  </div>;
}
