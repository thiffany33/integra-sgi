import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/pageHeading/pageHeading';

// Retention periods confirmed by the owner; NIF and address are still to be provided.
const PRIVACY_CONTROLLER = {
  name: 'Thiffany Gonçalves',
  nif: '[NIF por definir]',
  address: '[morada por definir]',
  email: 'thiffanyg33@gmail.com',
};
const RETENTION = { accountDays: 30, contactMonths: 12 };
const LAST_UPDATED = '2026-11-07';

function List({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-2 pl-6">{items.map(item => <li key={item}>{item}</li>)}</ul>;
}

export default function Privacy() {
  const { t, i18n } = useTranslation('privacy');
  const list = (key: string) => t(key, { returnObjects: true, ...RETENTION }) as string[];
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(LAST_UPDATED));

  return <>
    <PageHeading eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
    <div className="reading-content space-y-8">
      <p className="text-sm text-muted-foreground">{t('updated', { date })}</p>
      <section><h2>{t('controllerTitle')}</h2><p>{t('controllerBody', PRIVACY_CONTROLLER)}</p></section>
      <section><h2>{t('dataTitle')}</h2><List items={list('dataItems')} /></section>
      <section><h2>{t('purposeTitle')}</h2><List items={list('purposeItems')} /><p className="mt-3">{t('purposeNote')}</p></section>
      <section><h2>{t('cookiesTitle')}</h2><p>{t('cookiesBody')}</p></section>
      <section><h2>{t('processorsTitle')}</h2><List items={list('processorsItems')} /><p className="mt-3">{t('processorsNote')}</p></section>
      <section><h2>{t('retentionTitle')}</h2><List items={list('retentionItems')} /></section>
      <section><h2>{t('rightsTitle')}</h2><p>{t('rightsBody', { email: PRIVACY_CONTROLLER.email })}</p><p className="mt-3">{t('rightsComplaint')}</p></section>
      <section><h2>{t('securityTitle')}</h2><p>{t('securityBody')}</p></section>
      <section><h2>{t('changesTitle')}</h2><p>{t('changesBody')}</p></section>
    </div>
  </>;
}
