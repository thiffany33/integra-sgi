import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from '@/api/files.api';
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement9_3() {
  return (
    <>
      <h1>9.3 Revisão pela Gestão</h1>

      <Accordion title="O que é?">
        <p>
          A revisão pela gestão é a avaliação periódica, feita pela gestão de
          topo, do estado e do desempenho do Sistema Integrado de Gestão.
        </p>

        <p>
          Serve para confirmar se o sistema continua adequado à organização,
          se tem os recursos necessários e se está a alcançar os resultados
          pretendidos.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>A revisão deve analisar:</p>
        <ul>
          <li>o estado das ações definidas em revisões anteriores;</li>
          <li>as alterações internas e externas relevantes para a organização e para o sistema;</li>
          <li>a evolução dos objetivos, dos indicadores e do desempenho dos processos;</li>
          <li>os resultados das auditorias internas e, quando aplicável, externas;</li>
          <li>as não conformidades, os incidentes, as ações corretivas e os resultados obtidos;</li>
          <li>a satisfação do cliente e outras informações das partes interessadas, conforme aplicável;</li>
          <li>o desempenho ambiental, o cumprimento das obrigações de conformidade e a evolução dos aspetos ambientais;</li>
          <li>o desempenho de segurança e saúde no trabalho, os incidentes, os perigos e riscos e a consulta e participação dos trabalhadores, conforme aplicável;</li>
          <li>a adequação dos recursos humanos, técnicos, financeiros e materiais;</li>
          <li>a eficácia das ações para tratar riscos e oportunidades e as oportunidades de melhoria.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <h3>Resultados da revisão</h3>
        <p>
          A revisão deve produzir conclusões e decisões, e não apenas uma
          reunião ou uma apresentação de dados. Os resultados podem incluir
          decisões sobre melhorias, alterações no sistema, objetivos,
          prioridades, recursos e ações a implementar.
        </p>

        <p>
          As conclusões e decisões devem ficar registadas, com responsáveis e
          prazos para as ações acordadas, e a sua execução deve ser
          acompanhada.
        </p>

        <h3>Exemplo</h3>
        <p>
          A gestão verifica que o consumo de energia aumentou, que existem
          reclamações recorrentes e que uma auditoria identificou falhas no
          cumprimento de um procedimento. Pode decidir investir em
          equipamentos mais eficientes, rever o processo que origina as
          reclamações, reforçar a formação e acompanhar os resultados numa
          revisão seguinte.
        </p>
      </Accordion>

      <Accordion title="Ferramentas de Apoio">
        <div>
          <h3>Relatório de Revisão pela Gestão</h3>
          <p>
            Organiza a identificação da revisão, os participantes, as entradas
            analisadas, as decisões, os responsáveis e os prazos.
          </p>
          <div>
            <DownloadLink
              href={filesApi.templateDownloadUrl('management-review')}
              download
            >Baixar Relatório de revisão pela gestão</DownloadLink>
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
        previousLink="/requirement9_2"
        previousLabel="9.2 Auditoria Interna"
        nextLink="/requirement"
        nextLabel="Voltar ao guia de gestão"
      />
    </>
  );
}

export default Requirement9_3;
