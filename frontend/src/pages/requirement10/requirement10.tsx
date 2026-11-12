import { Link } from "react-router-dom";
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement10() {
  return (
    <>
      <h1>Requisito 10 - Melhoria</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 10 orienta a organização a corrigir o que não correu
          como previsto e a procurar formas de melhorar os produtos, os
          serviços, os processos e o Sistema Integrado de Gestão. A melhoria
          inclui tratar não conformidades e aproveitar oportunidades antes de
          existir um problema.
        </p>
        <p>
          As normas e as respetivas edições podem organizar os pontos de
          melhoria de forma diferente. A organização deve confirmar os
          requisitos aplicáveis a cada sistema e pode coordenar os processos
          comuns no SIG.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Um sistema de gestão eficaz aprende com os resultados e adapta-se a
          mudanças, desvios e novas necessidades. A melhoria ajuda a prevenir
          a repetição de problemas, aumentar a satisfação dos clientes,
          reduzir impactos ambientais e fortalecer a prevenção de lesões e
          problemas de saúde relacionados com o trabalho.
        </p>
      </Accordion>

      <Accordion title="Relação com a avaliação do desempenho">
        <p>
          Os resultados do requisito 9 são uma fonte importante para decidir
          onde atuar. A monitorização e a análise mostram tendências; as
          auditorias identificam falhas ou possibilidades de aperfeiçoamento;
          e a revisão pela gestão avalia resultados e define prioridades,
          recursos ou mudanças.
        </p>
        <p>
          A organização transforma essas conclusões em ações, acompanha a sua
          execução e avalia se produziram o efeito esperado. Assim, os dados do
          requisito 9 alimentam a melhoria tratada no requisito 10.
        </p>
      </Accordion>

      <Accordion title="Sub-requisitos">
        <ul>
          <li>
            <Link to="/requirement10_1">10.1 Generalidades</Link>: identificar
            oportunidades e implementar ações para alcançar os resultados
            pretendidos e melhorar o desempenho.
          </li>
          <li>
            <Link to="/requirement10_2">10.2 Não conformidade e ação corretiva</Link>:
            reagir a problemas, tratar as causas, implementar ações e verificar
            a sua eficácia.
          </li>
        </ul>
      </Accordion>

      <Accordion title="Exemplo integrado">
        <p>
          A análise dos indicadores mostra um aumento de reclamações por
          atrasos. A auditoria identifica falhas na passagem de informação
          entre equipas e a revisão pela gestão prioriza a melhoria do fluxo.
          A organização altera o processo, atribui responsáveis e acompanha
          os prazos e as reclamações para avaliar o resultado. Se identificar
          uma não conformidade, também regista o problema, trata as suas
          consequências e investiga a causa.
        </p>
      </Accordion>

      <Accordion title="Perguntas de verificação">
        <ul>
          <li>Os resultados do requisito 9 são usados para identificar melhorias?</li>
          <li>As oportunidades e não conformidades são registadas e avaliadas?</li>
          <li>As ações têm responsáveis, prazos e recursos adequados?</li>
          <li>A organização verifica os resultados das ações implementadas?</li>
          <li>As lições aprendidas são consideradas noutros processos relevantes?</li>
        </ul>
      </Accordion>

      <Accordion title="Referência Oficial">
        <p>
          Consulte as versões oficiais aplicáveis junto do{" "}
          <a href="https://www.ipq.pt" target="_blank" rel="noreferrer">
            Instituto Português da Qualidade (IPQ)
          </a>.
        </p>
      </Accordion>

      <RequirementNavigation
        previousLink="/requirement9_3"
        previousLabel="9.3 Revisão pela Gestão"
        nextLink="/requirement10_1"
        nextLabel="10.1 Generalidades"
      />
    </>
  );
}

export default Requirement10;
