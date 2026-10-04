import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
export default function MyContacts() {
  const { t } = useTranslation('help');
  return <section className="mt-8 rounded-xl border bg-card p-6">
    <h2 className="mb-3 text-xl">{t('myContacts')}</h2>
    <p className="mb-4 text-muted-foreground">{t('myContactsText')}</p>
    <Button asChild variant="outline"><Link to="/requirement">{t('openGuide')}</Link></Button>
  </section>;
}
