import { Link } from "react-router-dom";
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";
import { OfficialReference } from "@/components/officialReference/officialReference";

function Requirement9() {
  return (
    <>
      <h1>Requisito 9 - Avaliação do Desempenho</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 9 das normas ISO 9001, ISO 14001 e ISO 45001 estabelece
          a necessidade de avaliar o desempenho do Sistema Integrado de
          Gestão.
        </p>

        <p>
          O objetivo é perceber se os processos estão a funcionar como
          previsto, se os objetivos definidos estão a ser alcançados, se os
          requisitos aplicáveis são cumpridos e se existem oportunidades para
          corrigir problemas e melhorar o sistema.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          A organização não deve limitar-se a declarar que controla a
          qualidade, protege o ambiente ou previne acidentes. Deve recolher
          informação, analisar resultados, verificar a conformidade e usar
          evidências para fundamentar as decisões.
        </p>

        <p>
          Avaliar o desempenho significa acompanhar o funcionamento do sistema
          através de indicadores, medições, análises, auditorias e reuniões de
          revisão pela gestão. Os resultados permitem identificar tendências,
          desvios, riscos, incumprimentos e necessidades de melhoria.
        </p>
      </Accordion>

      <Accordion title="Sub-requisitos">
        <ul>
          <li>
            <Link to="/requirement9_1">9.1 Monitorização, Medição, Análise e Avaliação</Link>:
            definir o que acompanhar, como medir, quando avaliar e como
            interpretar os resultados.
          </li>
          <li>
            <Link to="/requirement9_2">9.2 Auditoria Interna</Link>: verificar,
            de forma planeada e imparcial, se o sistema cumpre os requisitos e
            está implementado eficazmente.
          </li>
          <li>
            <Link to="/requirement9_3">9.3 Revisão pela Gestão</Link>: a gestão
            de topo analisa o desempenho global e decide sobre recursos,
            prioridades e melhorias.
          </li>
        </ul>

        <p>
          As três partes complementam-se: a monitorização fornece dados, a
          auditoria verifica se o sistema cumpre os critérios e a revisão pela
          gestão usa os resultados para tomar decisões.
        </p>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          O requisito 9 liga-se aos restantes requisitos do sistema. Avalia se
          os objetivos definidos no requisito 6 estão a ser alcançados, se os
          controlos operacionais do requisito 8 funcionam e se os recursos do
          requisito 7 são adequados.
        </p>

        <h3>Como integrar os três sistemas</h3>
        <ul>
          <li>
            <strong>Indicadores:</strong> usar um painel comum de desempenho,
            mantendo indicadores e critérios próprios para qualidade, ambiente
            e segurança.
          </li>
          <li>
            <strong>Auditorias:</strong> coordenar o calendário num programa
            integrado, garantindo que o âmbito e os critérios cobrem cada norma
            aplicável.
          </li>
          <li>
            <strong>Revisão pela gestão:</strong> fazer uma revisão conjunta,
            incluindo todas as entradas e saídas exigidas pelas normas
            aplicáveis.
          </li>
          <li>
            <strong>Ações de melhoria:</strong> gerir as ações num registo
            comum, com responsável, prazo e estado.
          </li>
        </ul>

        <p>
          A integração evita duplicações, mas não significa que todos os
          indicadores, critérios ou obrigações sejam iguais.
        </p>

        <h3>Relação com o requisito 10 - Melhoria</h3>
        <p>
          O requisito 9 identifica desvios, tendências desfavoráveis,
          incumprimentos e oportunidades de melhoria. O requisito 10 trata as
          não conformidades, define ações corretivas e promove a melhoria
          contínua.
        </p>

        <p>
          Por exemplo: a monitorização revela um aumento de produtos não
          conformes; a auditoria identifica que um controlo não está a ser
          feito; a gestão decide disponibilizar recursos e rever o processo; e
          a organização trata a causa e verifica se o problema deixou de
          ocorrer.
        </p>
      </Accordion>

      <Accordion title="Perguntas de verificação">
        <ul>
          <li>A organização definiu os indicadores e as medições relevantes?</li>
          <li>Estão definidos métodos, frequências, responsáveis e critérios de avaliação?</li>
          <li>Os resultados são analisados e as evidências relevantes são guardadas?</li>
          <li>Existe um programa de auditorias internas baseado na importância dos processos, nas alterações e nos resultados anteriores?</li>
          <li>Os auditores são competentes e atuam com imparcialidade?</li>
          <li>Os resultados das auditorias são comunicados e as ações são acompanhadas?</li>
          <li>A gestão de topo faz revisões e analisa todas as entradas relevantes?</li>
          <li>As decisões, os responsáveis, os prazos e os recursos ficam registados?</li>
          <li>Os resultados do requisito 9 alimentam o tratamento de não conformidades e a melhoria contínua?</li>
        </ul>
      </Accordion>

      <Accordion title="Referência Oficial">
        <OfficialReference />
      </Accordion>

      <RequirementNavigation
        previousLink="/requirement8_9"
        previousLabel="8.9 Controlo de Não Conformidades de Produto e Processo"
        nextLink="/requirement9_1"
        nextLabel="9.1 Monitorização, Medição, Análise e Avaliação"
      />
    </>
  );
}

export default Requirement9;
