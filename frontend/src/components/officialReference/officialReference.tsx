import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { INTEGRATED_STANDARDS, STANDARDS, type StandardId } from "@/lib/standards";

type OfficialReferenceProps = { standards?: StandardId[]; children?: ReactNode };

// Links each standard that covers the requirement to its entry in the IPQ catalogue, never to iso.org.
export function OfficialReference({ standards = INTEGRATED_STANDARDS, children }: OfficialReferenceProps) {
  const { t } = useTranslation("common");
  return <>
    <p>Consulte a versão oficial {standards.length > 1 ? "das normas" : "da norma"} no catálogo do Instituto Português da Qualidade (IPQ):</p>
    <ul>
      {standards.map(id => {
        const standard = STANDARDS[id];
        return <li key={id}>
          <a href={standard.url} target="_blank" rel="noopener noreferrer">{standard.reference}<span className="sr-only"> {t("opensInNewTab")}</span></a> — {standard.title}
        </li>;
      })}
    </ul>
    {children}
  </>;
}
