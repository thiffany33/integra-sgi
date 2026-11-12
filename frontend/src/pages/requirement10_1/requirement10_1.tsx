import { useOnboarding } from "@/contexts/onboarding-state";
import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from "@/api/files.api";
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";
import { OfficialReference } from "@/components/officialReference/officialReference";

function Requirement10_1() {
  const { systems } = useOnboarding();
  const showAll = !systems.sgq && !systems.sga && !systems.sgsst;

  return (
    <>
      <h1>10.1 Generalidades</h1>

      <Accordion title="O que é?">
        <p>
          A organização deve identificar oportunidades de melhoria e
          implementar ações adequadas para alcançar os resultados pretendidos
          pelo sistema de gestão. As ações podem melhorar processos, produtos
          e serviços, aumentar a satisfação dos clientes e reforçar o
          desempenho e a eficácia do SIG.
        </p>
        <p>
          Nem toda a melhoria começa com uma falha. Uma oportunidade também
          pode surgir de uma nova necessidade, de uma mudança na organização
          ou de uma forma mais eficaz de realizar uma atividade.
        </p>
      </Accordion>

      <Accordion title="Como identificar oportunidades?">
        <p>
          Considere os resultados da avaliação do desempenho e outras
          informações sobre o contexto da organização. Por exemplo:
        </p>
        <ul>
          <li>tendências nos indicadores e nos resultados dos processos;</li>
          <li>avaliação da satisfação, reclamações e sugestões de clientes;</li>
          <li>resultados de monitorizações, inspeções e auditorias;</li>
          <li>conclusões e decisões da revisão pela gestão;</li>
          <li>sugestões dos trabalhadores, incidentes e quase-acidentes;</li>
          <li>alterações tecnológicas, legais, operacionais ou nas necessidades das partes interessadas.</li>
        </ul>
        <p>
          Avalie quais oportunidades são relevantes, os benefícios esperados,
          os recursos necessários e os riscos associados antes de definir as
          ações.
        </p>
      </Accordion>

      <Accordion title="Como implementar e acompanhar?">
        <ol>
          <li>Descreva a oportunidade e o resultado que pretende alcançar.</li>
          <li>Defina ações proporcionais, responsáveis, prazos e recursos.</li>
          <li>Implemente as ações e comunique as mudanças necessárias.</li>
          <li>Escolha como avaliar o resultado, usando indicadores ou outros critérios adequados.</li>
          <li>Compare os resultados com a situação inicial e decida se é necessário ajustar as ações.</li>
        </ol>
        <p>
          Guarde evidências adequadas ao tipo de melhoria e à dimensão da ação.
          A organização define a forma de registo conforme os requisitos
          aplicáveis; não existe um formulário único obrigatório para todas as
          situações.
        </p>
      </Accordion>

      <Accordion title="Aplicação nos sistemas selecionados">
        <p>Exemplos de oportunidades que podem ser analisadas no SIG:</p>
        {(showAll || systems.sgq) && <>
          <h3>Qualidade</h3>
          <p>Reduzir erros de processamento, melhorar prazos de entrega ou simplificar uma etapa que afeta a experiência do cliente.</p>
        </>}
        {(showAll || systems.sga) && <>
          <h3>Ambiente</h3>
          <p>Reduzir consumos e resíduos, prevenir derrames ou melhorar o controlo dos aspetos ambientais significativos.</p>
        </>}
        {(showAll || systems.sgsst) && <>
          <h3>Segurança e saúde no trabalho</h3>
          <p>Eliminar perigos, reduzir a exposição a riscos e melhorar a participação dos trabalhadores nas medidas preventivas.</p>
        </>}
      </Accordion>

      <Accordion title="Ferramentas de apoio">
        <h3>Lista de ocorrências e ações de melhoria</h3>
        <p>
          Use o modelo para registar oportunidades, ocorrências, ações,
          responsáveis e acompanhamento. Adapte os campos ao processo e às
          necessidades da organização.
        </p>
        <DownloadLink href={filesApi.templateDownloadUrl("occurrence-register")} download>
          Baixar Lista de ocorrências e ações de melhoria
        </DownloadLink>
      </Accordion>

      <Accordion title="Referência Oficial">
        <OfficialReference />
      </Accordion>

      <RequirementNavigation
        previousLink="/requirement10"
        previousLabel="Requisito 10 - Melhoria"
        nextLink="/requirement10_2"
        nextLabel="10.2 Não conformidade e ação corretiva"
      />
    </>
  );
}

export default Requirement10_1;
