import Banner from "@/components/banner/banner";
import HowItWorks from "@/components/howItWorks/howItWorks";
import PromotionalBanner from "@/components/promotionalBanner/promotionalBanner";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
export default function Home() {
  const { t } = useTranslation('home');
  return <><Banner /><HowItWorks /><PromotionalBanner /><p className="py-8 text-center text-muted-foreground">{t('homeHelp')} <Link to="/contact" className="text-link">{t('faq')}</Link></p></>;
}
