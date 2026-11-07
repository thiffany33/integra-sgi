import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from '@/api/files.api';
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement9_2() {
  return (
    <>
      <h1>9.2 Auditoria Interna</h1>

      <Accordion title="O que é?">
        <p>
          A auditoria interna é uma avaliação sistemática, planeada e
          documentada. Permite verificar se o Sistema Integrado de Gestão
          cumpre os critérios definidos, os requisitos das normas aplicáveis e
          os requisitos da própria organização, e se está implementado e
          mantido de forma eficaz.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          A auditoria dá à organização uma visão objetiva sobre o
          funcionamento do sistema: o que está conforme e o que precisa de ser
          tratado.
        </p>

        <p>
          A auditoria não é uma procura de culpados nem uma simples conferência
          de documentos. O seu objetivo é obter evidências objetivas.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li><strong>Definir o programa de auditorias:</strong> planear as auditorias ao longo de um período, considerando a importância dos processos, as alterações, os resultados anteriores e os riscos.</li>
          <li><strong>Definir critérios e âmbito:</strong> indicar o que vai ser auditado, onde, quando e com base em que requisitos ou procedimentos.</li>
          <li><strong>Selecionar auditores competentes e imparciais:</strong> garantir conhecimento adequado e evitar que os auditores avaliem o próprio trabalho.</li>
          <li><strong>Preparar a auditoria:</strong> rever documentos, preparar perguntas e listas de verificação e combinar a realização das atividades.</li>
          <li><strong>Recolher evidências:</strong> analisar documentos e registos, observar atividades e entrevistar as pessoas relevantes.</li>
          <li><strong>Registar as constatações:</strong> documentar conformidades, não conformidades e oportunidades de melhoria, distinguindo factos de opiniões.</li>
          <li><strong>Comunicar os resultados:</strong> apresentar as conclusões às pessoas responsáveis e à gestão.</li>
          <li><strong>Acompanhar as ações:</strong> verificar se as não conformidades foram tratadas e se as ações foram eficazes.</li>
          <li><strong>Guardar as evidências:</strong> conservar o programa, os planos, os relatórios e os registos, de acordo com as regras de informação documentada.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <h3>Exemplo de auditoria integrada</h3>
        <p>
          Numa empresa alimentar, uma auditoria pode verificar se os registos
          de controlo do produto estão completos, se os resíduos são separados
          de acordo com as regras e se os trabalhadores cumprem os
          procedimentos de segurança.
        </p>

        <p>
          A auditoria pode ser coordenada num único plano, desde que o âmbito
          e os critérios cubram adequadamente os requisitos de cada norma
          aplicável.
        </p>
      </Accordion>

      <Accordion title="Ferramentas de Apoio">
        <div>
          <h3>Plano de Auditoria</h3>
          <p>
            Define a identificação da auditoria, o âmbito, os critérios, a
            equipa auditora e o programa das atividades.
          </p>
          <div>
            <DownloadLink
              href={filesApi.templateDownloadUrl('audit-plan')}
              download
            >Baixar Plano de auditoria</DownloadLink>
          </div>
        </div>

        <div>
          <h3>Relatório de Auditoria</h3>
          <p>
            Regista as constatações, as não conformidades, as oportunidades de
            melhoria e as conclusões da auditoria.
          </p>
          <div>
            <DownloadLink
              href={filesApi.templateDownloadUrl('audit-report')}
              download
            >Baixar Relatório de auditoria</DownloadLink>
          </div>
        </div>

        <div>
          <h3>Guia de Preenchimento</h3>
          <p>
            Explica, passo a passo, como preencher o plano e o relatório de
            auditoria.
          </p>
          <div>
            <DownloadLink
              href={filesApi.templateDownloadUrl('audit-guide')}
              download
            >Baixar Guia de preenchimento do plano e relatório de auditoria</DownloadLink>
          </div>
        </div>
      </Accordion>

      <Accordion title="Referência Oficial">
        <p>
          Consulte a versão oficial da norma através do{" "}
          <a
            href="https://www.ipq.pt"
            target="_blank"
            rel="noreferrer"
          >
            Instituto Português da Qualidade (IPQ)
          </a>.
        </p>
      </Accordion>

      <RequirementNavigation
        previousLink="/requirement9_1"
        previousLabel="9.1 Monitorização, Medição, Análise e Avaliação"
        nextLink="/requirement9_3"
        nextLabel="9.3 Revisão pela Gestão"
      />
    </>
  );
}

export default Requirement9_2;
