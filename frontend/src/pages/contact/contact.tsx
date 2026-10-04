import { PageHeading } from "@/components/pageHeading/pageHeading";
import ContactForm from "@/components/contactForm/contactForm";
import MyContacts from "@/components/myContacts/myContacts";
import Accordion from "@/components/accordion/accordion";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
export default function Contact() {
  const { t } = useTranslation(['help', 'common']);
  return <><PageHeading eyebrow={t('help:contactEyebrow')} title={t('help:contactTitle')} description={t('help:contactDescription')} />
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
      <div className="reading-content">
        <Accordion title={t('help:startQuestion')}><p>{t('help:startAnswer')}</p><Link className="text-link" to="/register">{t('onboarding:organizationTitle')}</Link></Accordion>
        <Accordion title={t('help:sgiQuestion')}><p>{t('help:sgiAnswer')}</p></Accordion>
        <Accordion title={t('help:templatesQuestion')}><p>{t('help:templatesAnswer')} <Link to="/downloads">{t('common:downloads')}</Link></p></Accordion>
        <Accordion title={t('help:dataQuestion')}><p>{t('help:dataAnswer')}</p></Accordion>
        <MyContacts />
      </div>
      <ContactForm />
    </div>
  </>;
}
