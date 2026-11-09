import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Type } from 'lucide-react';
import { textSizes, type TextSize } from '@integra/shared/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { readingPreferencesOf } from '@/lib/reading-preferences';
import { Feedback, ProfileGate, ProfileSubpage, type AuthenticatedContext, type Message } from './profile-shared';

function ReadingSettings({ auth }: { auth: AuthenticatedContext }) {
  const { t } = useTranslation('profile');
  const [textSize, setTextSize] = useState<TextSize>(readingPreferencesOf(auth.user).textSize);
  const [highContrast, setHighContrast] = useState(readingPreferencesOf(auth.user).highContrast);
  const [message, setMessage] = useState<Message>(null);
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(null);
    try {
      await auth.updateReadingPreferences({ textSize, highContrast });
      setMessage({ kind: 'success', text: t('readingSaved') });
    } catch {
      setMessage({ kind: 'error', text: t('saveError') });
    } finally { setSaving(false); }
  }

  return <ProfileSubpage title={t('readingAreaTitle')} description={t('readingAreaDescription')}>
    <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl"><Type className="size-6 text-primary" aria-hidden="true" />{t('readingTitle')}</h2><p className="text-base text-muted-foreground">{t('readingDescription')}</p></CardHeader><CardContent><form className="space-y-6" onSubmit={save}>
      <fieldset className="space-y-3"><legend className="mb-3 text-lg font-semibold">{t('textSizeLegend')}</legend>
        {textSizes.map(size => <label key={size} className="flex min-h-12 items-center gap-3 rounded-lg border px-4 py-2 text-base">
          <input type="radio" name="text-size" className="size-5 accent-primary" checked={textSize === size} onChange={() => setTextSize(size)} disabled={saving} />
          <span>{t(`textSize_${size}`)}</span>
        </label>)}
      </fieldset>
      <label className="flex min-h-12 items-start gap-3 rounded-lg border px-4 py-3 text-base">
        <input type="checkbox" className="mt-1 size-5 shrink-0 accent-primary" checked={highContrast} onChange={event => setHighContrast(event.target.checked)} disabled={saving} />
        <span><span className="font-semibold">{t('highContrastLabel')}</span><br /><span className="text-muted-foreground">{t('highContrastHint')}</span></span>
      </label>
      <p className="text-base text-muted-foreground">{t('readingSavedHint')}</p>
      <Feedback message={message} />
      <Button type="submit" disabled={saving}>{saving ? t('saving') : t('saveReading')}</Button>
    </form></CardContent></Card>
  </ProfileSubpage>;
}

export default function ProfileReading() {
  return <ProfileGate returnTo="/profile/reading">{auth => <ReadingSettings key={auth.user.id} auth={auth} />}</ProfileGate>;
}
