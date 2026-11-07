import type { ReactNode } from "react";
import { Accordion as AccordionRoot, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from 'react-i18next';

type AccordionProps = { title: string; children: ReactNode };

export default function Accordion({ title, children }: AccordionProps) {
  const { t } = useTranslation('requirements');
  const titleKeys: Record<string, string> = {
    'O que é?': 'what', 'Por que é importante?': 'why', 'Por que é importante': 'why',
    'Como Implementar?': 'how', 'Como implementar?': 'how', 'Como implementar': 'how',
    'Explicação do Requisito': 'explanation', 'Explicação do requisito': 'explanation',
    'Ferramentas de Apoio': 'tools', 'Ferramentas de apoio': 'tools', 'Guias de Elaboração': 'guides',
    'REFERÊNCIA OFICIAL': 'reference', 'Referência Oficial': 'reference', 'Referência oficial': 'reference',
    'Sub-requisitos': 'subrequirements', 'Como funciona no Integra SIG?': 'howWorks',
    'Estrutura da Norma': 'structure', 'Como o auditor avalia este requisito?': 'audit',
  };
  const localizedTitle = titleKeys[title] ? t(titleKeys[title]) : title;
  return <AccordionRoot type="single" collapsible defaultValue={title === "O que é?" ? "content" : undefined} className="mb-4 rounded-xl border bg-card px-5 sm:px-6">
    <AccordionItem value="content" className="border-none">
      <AccordionTrigger className="min-h-16 items-center py-5 text-lg font-semibold no-underline hover:no-underline">{localizedTitle}</AccordionTrigger>
      <AccordionContent className="pb-6 pt-2">{children}</AccordionContent>
    </AccordionItem>
  </AccordionRoot>;
}
