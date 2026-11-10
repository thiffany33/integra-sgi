import { useTranslation } from 'react-i18next';
import { PageHeading } from '@/components/pageHeading/pageHeading';

// Mirrors the owner's privacy, retention and security policies (docs/); NIF and address are still to be provided.
const PRIVACY_CONTROLLER = {
  name: 'Thiffany Gonçalves',
  nif: '[NIF por definir]',
  address: '[morada por definir]',
  email: 'thiffanyg33@gmail.com',
};
const LAST_UPDATED = '2026-11-09';

type Block = { p: string } | { h: string } | { list: string[] } | { table: { head: [string, string]; rows: [string, string][] } };
type Section = { title: string; blocks: Block[] };

function PolicyBlock({ block }: { block: Block }) {
  if ('p' in block) return <p>{block.p}</p>;
  if ('h' in block) return <h3 className="pt-2 text-lg font-semibold">{block.h}</h3>;
  if ('list' in block) return <ul className="list-disc space-y-2 pl-6">{block.list.map(item => <li key={item}>{item}</li>)}</ul>;
  const { head, rows } = block.table;
  // Narrow screens get a list, so the text reflows instead of scrolling sideways (WCAG 1.4.10).
  return <>
    <table className="hidden w-full border-collapse text-left sm:table">
      <thead><tr>{head.map(cell => <th key={cell} scope="col" className="border-b-2 px-3 py-2 font-semibold">{cell}</th>)}</tr></thead>
      <tbody>{rows.map(([label, value]) => <tr key={label} className="border-b align-top">
        <th scope="row" className="px-3 py-2 font-medium">{label}</th><td className="px-3 py-2">{value}</td>
      </tr>)}</tbody>
    </table>
    <dl className="divide-y border-y sm:hidden">{rows.map(([label, value]) => <div key={label} className="space-y-1 py-3">
      <dt className="font-semibold">{label}</dt>
      <dd><span className="sr-only">{head[1]}: </span>{value}</dd>
    </div>)}</dl>
  </>;
}

export default function Privacy() {
  const { t, i18n } = useTranslation('privacy');
  const sections = t('sections', { returnObjects: true, ...PRIVACY_CONTROLLER }) as Section[];
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(LAST_UPDATED));

  return <>
    <PageHeading eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
    <div className="reading-content space-y-8 break-words">
      <p className="text-sm text-muted-foreground">{t('updated', { date })}</p>
      {sections.map(section => <section key={section.title} className="space-y-3">
        <h2>{section.title}</h2>
        {section.blocks.map((block, index) => <PolicyBlock key={index} block={block} />)}
      </section>)}
    </div>
  </>;
}
