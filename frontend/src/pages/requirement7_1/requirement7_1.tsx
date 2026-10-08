import { useTranslation } from "react-i18next";
import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from "@/api/files.api";
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement7_1() {
  const { t } = useTranslation("requirements");

  return (
    <>
      <h1>{t("requirement71Title")}</h1>

      <Accordion title={t("what")}>
        <p>{t("resourcesWhatText")}</p>
      </Accordion>

      <Accordion title={t("why")}>
        <p>{t("resourcesWhyText")}</p>
      </Accordion>

      <Accordion title={t("explanation")}>
        <p>{t("resourcesExplanationText")}</p>
        <ul className="my-4 list-disc space-y-2 pl-6">
          <li>{t("resourcesPeople")}</li>
          <li>{t("resourcesInfrastructure")}</li>
          <li>{t("resourcesEnvironment")}</li>
          <li>{t("resourcesKnowledge")}</li>
          <li>{t("resourcesMaterials")}</li>
          <li>{t("resourcesFinancial")}</li>
        </ul>
        <p>{t("resourcesActionText")}</p>
      </Accordion>

      <Accordion title={t("tools")}>
        <DownloadLink href={filesApi.templateDownloadUrl("document-control-resources")}>
          {t("documentControlResourcesDownload")}
        </DownloadLink>
      </Accordion>

      <RequirementNavigation
        previousLink="/requirement7"
        previousLabel={t("requirement71Previous")}
        nextLink="/requirement7_2"
        nextLabel={t("requirement71Next")}
      />
    </>
  );
}

export default Requirement7_1;
