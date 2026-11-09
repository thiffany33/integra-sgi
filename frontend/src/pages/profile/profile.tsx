import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, ChevronRight, LockKeyhole, Type, UserRound } from 'lucide-react';
import { PageHeading } from '@/components/pageHeading/pageHeading';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { readingPreferencesOf } from '@/lib/reading-preferences';
import { ProfileGate, type AuthenticatedContext } from './profile-shared';
import { SelectedSystemsList } from './selected-systems';

/** One area of the overview: what is saved today, as readable text, and the link that opens it. */
function Area({ icon, title, to, action, children }: { icon: ReactNode; title: string; to: string; action: string; children: ReactNode }) {
  return <Card className="shadow-none"><CardHeader><h2 className="flex items-center gap-3 text-2xl">{icon}{title}</h2></CardHeader><CardContent className="space-y-4">
    <div className="space-y-1 text-base">{children}</div>
    <Link to={to} className="text-link inline-flex min-h-12 items-center gap-1 text-base font-semibold">{action}<ChevronRight className="size-4" aria-hidden="true" /></Link>
  </CardContent></Card>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <p><span className="text-muted-foreground">{label}: </span><span className="break-all">{value}</span></p>;
}

function ProfileOverview({ auth }: { auth: AuthenticatedContext }) {
  const { t } = useTranslation('profile');
  const { user, profile } = auth;
  const preferences = readingPreferencesOf(user);
  const reading = [t(`textSize_${preferences.textSize}`), preferences.highContrast ? t('highContrastOn') : null].filter(Boolean).join(' · ');
  return <div className="mx-auto max-w-4xl space-y-6 pb-8">
    <PageHeading title={t('title')} description={t('description')} />
    <Area icon={<UserRound className="size-6 text-primary" aria-hidden="true" />} title={t('accountAreaTitle')} to="/profile/account" action={t('openAccountArea')}>
      <Detail label={t('accountName')} value={user.name} />
      <Detail label={t('accountEmail')} value={user.email} />
    </Area>
    {/* Administrators manage companies; their own account has no organization to keep. */}
    {!user.isAdmin && <Area icon={<Building2 className="size-6 text-primary" aria-hidden="true" />} title={t('organizationAreaTitle')} to="/profile/organization" action={t('openOrganizationArea')}>
      <Detail label={t('organizationName')} value={profile.organization.name} />
      <Detail label={t('representativeName')} value={profile.representative.name} />
      <p className="text-muted-foreground">{t('selectedSystemsTitle')}:</p>
      <SelectedSystemsList systems={profile.selectedSystems} />
    </Area>}
    <Area icon={<LockKeyhole className="size-6 text-primary" aria-hidden="true" />} title={t('securityAreaTitle')} to="/profile/security" action={t('openSecurityArea')}>
      <p>{user.isAdmin ? t('securitySummaryAdmin') : t('securitySummary')}</p>
    </Area>
    <Area icon={<Type className="size-6 text-primary" aria-hidden="true" />} title={t('readingAreaTitle')} to="/profile/reading" action={t('openReadingArea')}>
      <p>{reading}</p>
    </Area>
  </div>;
}

export default function Profile() {
  return <ProfileGate returnTo="/profile">{auth => <ProfileOverview auth={auth} />}</ProfileGate>;
}
