import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { INTEGRATED_STANDARDS, STANDARDS, type StandardId } from "@/lib/standards";

type OfficialReferenceProps = { standards?: StandardId[]; children?: ReactNode };

// Opens the standard's entry in the IPQ catalogue; the label defaults to its reference.
export function StandardLink({ id, children }: { id: StandardId; children?: ReactNode }) {
  const { t } = useTranslation("common");
  const standard = STANDARDS[id];
  return <a href={standard.url} target="_blank" rel="noopener noreferrer">{children ?? standard.reference}<span className="sr-only"> {t("opensInNewTab")}</span></a>;
}

// Links each standard that covers the requirement to its entry in the IPQ catalogue, never to iso.org.
export function OfficialReference({ standards = INTEGRATED_STANDARDS, children }: OfficialReferenceProps) {
  return <>
    <p>Consulte a versão oficial {standards.length > 1 ? "das normas" : "da norma"} no catálogo do Instituto Português da Qualidade (IPQ):</p>
    <ul>
      {standards.map(id => <li key={id}><StandardLink id={id} /> — {STANDARDS[id].title}</li>)}
    </ul>
    {children}
  </>;
}
