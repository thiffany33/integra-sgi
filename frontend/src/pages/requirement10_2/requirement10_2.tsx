import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from "@/api/files.api";
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement10_2() {
  return (
    <>
      <h1>10.2 Não conformidade e ação corretiva</h1>

      <Accordion title="O que é?">
        <p>
          Uma não conformidade ocorre quando um requisito não é cumprido. Ao
          detetá-la, a organização deve reagir de forma adequada, controlar e
          corrigir a situação quando aplicável, tratar as consequências e
          avaliar se é necessário eliminar a causa para evitar que volte a
          acontecer ou ocorra noutro local.
        </p>
        <p>
          A correção trata o problema detetado. A ação corretiva trata a causa
          para prevenir a recorrência. Uma ação imediata pode ser necessária,
          mas não substitui a análise da causa quando esta for aplicável.
        </p>
      </Accordion>

      <Accordion title="Como tratar uma não conformidade?">
        <ol>
          <li><strong>Identificar e registar:</strong> descreva os factos, quando e onde ocorreram e os requisitos potencialmente afetados.</li>
          <li><strong>Reagir:</strong> contenha ou controle a situação, corrija o que for possível e trate as consequências.</li>
          <li><strong>Avaliar:</strong> determine a gravidade, os impactos e se existem situações semelhantes ou riscos de recorrência.</li>
          <li><strong>Investigar:</strong> analise as causas com profundidade adequada, recorrendo, por exemplo, a uma sequência de perguntas “porquê” ou a um diagrama de causa e efeito.</li>
          <li><strong>Planear e executar:</strong> defina ações proporcionais, responsáveis, prazos e recursos; envolva as pessoas relevantes.</li>
          <li><strong>Verificar:</strong> avalie, após a implementação, se as ações eliminaram ou reduziram a causa e se o problema deixou de ocorrer.</li>
          <li><strong>Atualizar o sistema:</strong> altere controlos, riscos, procedimentos ou formação quando necessário e partilhe as lições aprendidas.</li>
        </ol>
        <p>
          Se a ação não for eficaz, reabra a análise, reveja as causas e defina
          medidas adicionais. Registe a natureza da não conformidade, as ações
          tomadas e os resultados da ação corretiva, conforme os requisitos
          aplicáveis.
        </p>
      </Accordion>

      <Accordion title="Aplicação integrada e participação">
        <p>
          Uma ocorrência pode afetar simultaneamente a qualidade, o ambiente
          e a segurança e saúde no trabalho. O tratamento pode ser comum, mas
          a organização deve avaliar cada impacto, obrigação e requisito
          aplicável.
        </p>
        <p>
          Ao investigar incidentes de segurança e saúde no trabalho, envolva
          os trabalhadores e outras pessoas relevantes de acordo com o
          contexto e os requisitos aplicáveis. As medidas devem priorizar a
          eliminação dos perigos e a redução dos riscos.
        </p>
      </Accordion>

      <Accordion title="Ferramentas de apoio">
        <h3>Lista de ocorrências e ações de melhoria</h3>
        <p>
          Registe a descrição, a causa, a ação, o responsável, o prazo, o
          estado e a verificação da eficácia. Limite o acesso a dados pessoais
          do registo às pessoas que precisam deles.
        </p>
        <div className="mb-6">
          <DownloadLink href={filesApi.templateDownloadUrl("occurrence-register")} download>
            Baixar Lista de ocorrências e ações de melhoria
          </DownloadLink>
        </div>

        <h3>Relatório de acidente de trabalho</h3>
        <p>
          O modelo apoia o registo e a investigação de acidentes de trabalho.
          Adapte o seu uso aos procedimentos internos e às obrigações legais
          aplicáveis.
        </p>
        <DownloadLink href={filesApi.templateDownloadUrl("work-accident-report")} download>
          Baixar Relatório de acidente de trabalho
        </DownloadLink>
      </Accordion>

      <Accordion title="Perguntas de verificação">
        <ul>
          <li>A organização contém a situação e trata as suas consequências?</li>
          <li>As causas e a possibilidade de recorrência são avaliadas?</li>
          <li>As ações são proporcionais aos efeitos e têm responsáveis e prazos?</li>
          <li>A eficácia é verificada depois da implementação?</li>
          <li>Os registos e as alterações necessárias ao sistema são mantidos?</li>
          <li>Os trabalhadores participam na investigação dos incidentes relevantes?</li>
        </ul>
      </Accordion>

      <Accordion title="Referência Oficial">
        <p>
          Consulte os requisitos aplicáveis junto do{" "}
          <a href="https://www.ipq.pt" target="_blank" rel="noreferrer">
            Instituto Português da Qualidade (IPQ)
          </a>{" "}
          e confirme as obrigações legais aplicáveis com a entidade competente.
        </p>
      </Accordion>

      <RequirementNavigation
        previousLink="/requirement10_1"
        previousLabel="10.1 Generalidades"
        nextLink="/requirement"
        nextLabel="Voltar ao guia de gestão"
      />
    </>
  );
}

export default Requirement10_2;
