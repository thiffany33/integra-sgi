import { useOnboarding } from "@/contexts/onboarding-state";
import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from '@/api/files.api';
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";
import { OfficialReference } from "@/components/officialReference/officialReference";

function Requirement9_1() {
  const { systems } = useOnboarding();
  // Without a saved choice, show every system rather than an empty section.
  const showAll = !systems.sgq && !systems.sga && !systems.sgsst;

  return (
    <>
      <h1>9.1 Monitorização, Medição, Análise e Avaliação</h1>

      <Accordion title="O que é?">
        <p>
          A organização deve determinar o que precisa de ser monitorizado e
          medido, os métodos adequados, a frequência das atividades e o
          momento em que os resultados são analisados e avaliados.
        </p>

        <p>
          A informação obtida deve ser suficientemente fiável para apoiar
          decisões.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li><strong>O que monitorizar ou medir:</strong> processos, produtos, serviços, aspetos ambientais, riscos profissionais, objetivos e outros elementos relevantes.</li>
          <li><strong>Como medir:</strong> indicadores, inspeções, observações, listas de verificação, ensaios, registos, inquéritos ou outros métodos adequados.</li>
          <li><strong>Quando e com que frequência:</strong> por turno, diariamente, mensalmente, trimestralmente ou conforme o risco e a necessidade.</li>
          <li><strong>Quem é responsável:</strong> a pessoa ou função que recolhe, valida e analisa a informação.</li>
          <li><strong>Quais são os critérios:</strong> metas, limites legais, especificações, requisitos internos ou valores de referência.</li>
          <li><strong>Como analisar e avaliar:</strong> comparar resultados com as metas e com períodos anteriores, identificar tendências e investigar desvios.</li>
          <li><strong>Que evidências guardar:</strong> registos, relatórios, resultados de medições, gráficos, atas ou formulários.</li>
        </ul>

        <p>
          Não existe uma frequência igual para todos os indicadores. A
          organização deve definir uma periodicidade que permita controlar o
          desempenho de forma eficaz, de acordo com o processo e o risco.
        </p>
      </Accordion>

      <Accordion title="Aplicação nos sistemas selecionados">
        <p>
          São apresentados os sistemas de gestão escolhidos para a sua
          organização.
        </p>

        {(showAll || systems.sgq) && <>
          <h3>Qualidade (ISO 9001)</h3>
          <p>
            Exemplos: reclamações, devoluções, produtos não conformes, entregas
            no prazo e satisfação do cliente. Servem para verificar se os
            produtos e serviços cumprem os requisitos e se os clientes estão
            satisfeitos.
          </p>
        </>}

        {(showAll || systems.sga) && <>
          <h3>Ambiente (ISO 14001)</h3>
          <p>
            Exemplos: consumo de água e energia, quantidade de resíduos,
            emissões e avaliação do cumprimento das obrigações de conformidade.
            Servem para avaliar o desempenho ambiental e o cumprimento das
            obrigações aplicáveis.
          </p>
        </>}

        {(showAll || systems.sgsst) && <>
          <h3>Segurança e Saúde no Trabalho (ISO 45001)</h3>
          <p>
            Exemplos: acidentes, incidentes, quase-acidentes, inspeções,
            exposição a perigos e execução de medidas preventivas. Servem para
            avaliar os resultados da prevenção e do controlo dos riscos
            profissionais.
          </p>
        </>}
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <h3>Exemplo</h3>
        <p>
          Uma empresa define como objetivo reduzir o consumo de água. Regista
          o consumo mensal, compara os valores com a meta, analisa as
          variações e procura as causas de eventuais aumentos. Se identificar
          uma fuga, regista o problema, corrige-o e acompanha os consumos
          seguintes para verificar se a medida foi eficaz.
        </p>

        <h3>Equipamentos de monitorização e medição</h3>
        <p>
          Quando as medições dependem de equipamentos, como balanças,
          termómetros ou medidores, estes devem ser adequados, identificados,
          verificados ou calibrados e protegidos contra ajustes que invalidem
          os resultados.
        </p>
      </Accordion>

      <Accordion title="Ferramentas de Apoio">
        <div>
          <h3>Equipamentos de Monitorização e Medição</h3>

          <p>
            O modelo ajuda a manter o inventário dos equipamentos, o plano
            anual de calibração, a identificação e verificação de cada
            equipamento e o registo de ocorrências.
          </p>

          <div>
            <DownloadLink
              href={filesApi.templateDownloadUrl('monitoring-equipment')}
              download
            >Baixar Equipamentos de monitorização e medição</DownloadLink>
          </div>
        </div>
      </Accordion>

      <Accordion title="Referência Oficial">
        <OfficialReference />
      </Accordion>

      <RequirementNavigation
        previousLink="/requirement9"
        previousLabel="Requisito 9 - Avaliação do Desempenho"
        nextLink="/requirement9_2"
        nextLabel="9.2 Auditoria Interna"
      />
    </>
  );
}

export default Requirement9_1;
