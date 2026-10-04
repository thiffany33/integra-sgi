import { FileText } from "lucide-react";
import { documents } from "@/config/documents";
import { PageHeading } from "@/components/pageHeading/pageHeading";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { useTranslation } from 'react-i18next';
export default function Downloads() {
  const { t } = useTranslation('downloads');
  return <><PageHeading eyebrow={t('eyebrow')} title={t('heading')} description={t('description')} />
    <p className="mb-8 max-w-3xl text-base text-muted-foreground">{t('formats')}</p>
    <div className="space-y-10">{["4", "5", "6", "7"].map(chapter => <section key={chapter} aria-labelledby={`chapter-${chapter}`}><h2 id={`chapter-${chapter}`} className="mb-5">{t('requirement', { chapter })}</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{documents.filter(doc => doc.chapter === chapter).map(doc => <Card key={doc.href} className="shadow-none"><CardContent className="flex h-full flex-col items-start gap-4"><div className="flex items-center gap-3"><FileText aria-hidden="true" className="size-6 text-secondary-foreground" /><Badge variant="secondary">{doc.format}</Badge></div><h3 className="flex-1">{doc.title}</h3><DownloadLink href={doc.href}>{t('download', { title: doc.title })}</DownloadLink></CardContent></Card>)}</div></section>)}</div>
  </>;
}
