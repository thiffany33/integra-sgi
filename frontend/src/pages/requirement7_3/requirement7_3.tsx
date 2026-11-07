import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from '@/api/files.api';
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement7_3() {
  return (
    <>
      <h1>7.3 Consciencialização</h1>

      <Accordion title="O que é?">
        <p>
          A organização deve garantir que as pessoas que trabalham sob
          o seu controlo estão conscientes da política, dos objetivos
          relevantes e da importância das suas atividades para o Sistema
          Integrado de Gestão.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          A consciencialização permite que os trabalhadores compreendam
          como o seu trabalho contribui para o desempenho da organização
          e para o cumprimento dos objetivos do sistema de gestão.
        </p>

        <p>
          Quando as pessoas conhecem as suas responsabilidades e o impacto
          das suas atividades, é mais fácil prevenir erros, reduzir riscos
          e promover a melhoria contínua.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li>Comunicar a política relevante aos trabalhadores.</li>
          <li>Explicar os objetivos relacionados com as suas atividades.</li>
          <li>
            Informar sobre os contributos individuais para o desempenho
            do sistema.
          </li>
          <li>
            Explicar as consequências do incumprimento dos requisitos
            aplicáveis.
          </li>
          <li>
            Promover ações de sensibilização sempre que necessário.
          </li>
          <li>Manter evidências das ações de consciencialização realizadas.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          A consciencialização não significa apenas informar os trabalhadores
          sobre a existência do Sistema Integrado de Gestão.
        </p>

        <p>
          É necessário garantir que as pessoas compreendem a política,
          os objetivos que estão relacionados com as suas atividades e
          a importância do seu trabalho para o funcionamento do sistema.
        </p>

        <p>
          Também devem conhecer as consequências de não cumprir os requisitos
          aplicáveis às suas atividades.
        </p>

        <p>
          A organização pode desenvolver ações de sensibilização através
          de reuniões, formações, comunicações internas, cartazes, campanhas
          ou outros meios adequados à sua realidade.
        </p>
      </Accordion>

      <Accordion title="Ferramentas de Apoio">
        <div>
          <h3>Plano de Formação</h3>

          <div>
            <DownloadLink
              href={filesApi.templateDownloadUrl('training-plan')}
              download
            >Baixar Plano de formação</DownloadLink>
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
        previousLink="/requirement7_2"
        previousLabel="7.2 Competência"
        nextLink="/requirement7_4"
        nextLabel="7.4 Comunicação"
      />
    </>
  );
}

export default Requirement7_3;