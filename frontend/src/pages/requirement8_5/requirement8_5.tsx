import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_5() {
  return (
    <>
      <h1>8.5 Produção e Prestação do Serviço</h1>

      <Accordion title="O que é?">
        <p>
          Este é um dos requisitos mais ligados à atividade principal da
          organização. A produção ou a prestação do serviço deve decorrer em
          condições controladas.
        </p>

        <p>
          Isto significa garantir que as pessoas têm a informação necessária,
          que os equipamentos estão disponíveis e que os critérios definidos
          são cumpridos.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>Conforme a atividade, pode envolver:</p>
        <ul>
          <li>procedimentos e instruções de trabalho;</li>
          <li>especificações e parâmetros de processo;</li>
          <li>inspeções e monitorização;</li>
          <li>identificação e rastreabilidade;</li>
          <li>manutenção;</li>
          <li>preservação;</li>
          <li>controlo de alterações;</li>
          <li>atividades depois da entrega.</li>
        </ul>
      </Accordion>

      <Accordion title="Identificação e rastreabilidade">
        <p>
          Quando a rastreabilidade é necessária, a organização deve conseguir
          identificar aquilo que está a ser produzido ou movimentado e, quando
          aplicável, relacioná-lo com a informação relevante do processo.
        </p>

        <p>Numa indústria alimentar, por exemplo:</p>
        <p>
          <strong>matéria-prima → lote → produção → produto acabado → cliente</strong>
        </p>

        <p>
          Assim é possível saber de onde veio um produto e para onde foi. A
          rastreabilidade é especialmente importante quando pode ser
          necessário retirar ou recolher produtos do mercado. Na ISO 22000, a
          rastreabilidade é tratada no requisito 8.3.
        </p>
      </Accordion>

      <Accordion title="Preservação">
        <p>
          A organização deve proteger os produtos e materiais durante as
          etapas em que é responsável por eles. Conforme o processo, isto pode
          envolver:
        </p>
        <ul>
          <li>armazenamento e embalagem;</li>
          <li>transporte;</li>
          <li>temperatura;</li>
          <li>proteção contra contaminação;</li>
          <li>identificação;</li>
          <li>manuseamento e conservação.</li>
        </ul>

        <p>
          O objetivo é evitar que o produto perca a sua conformidade durante
          o processo.
        </p>
      </Accordion>

      <Accordion title="Controlo de alterações">
        <p>
          Uma alteração no processo pode ter consequências inesperadas.
          Quando há mudanças relevantes, a organização deve avaliar:
        </p>
        <ul>
          <li>o que vai ser alterado e porquê;</li>
          <li>que riscos podem surgir, incluindo para a segurança dos trabalhadores;</li>
          <li>que requisitos podem ser afetados;</li>
          <li>quem precisa de ser informado;</li>
          <li>que controlos precisam de ser atualizados.</li>
        </ul>

        <h3>Exemplo</h3>
        <p>
          Uma empresa decide substituir uma matéria-prima. Essa mudança pode
          afetar a qualidade do produto, as especificações, a segurança dos
          alimentos, os fornecedores, os resíduos, o impacto ambiental, a
          legislação aplicável e a informação ao cliente. Num sistema
          integrado, a mudança deve ser analisada de forma integrada.
        </p>
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
        previousLink="/requirement8_4"
        previousLabel="8.4 Controlo de Processos, Produtos e Serviços Fornecidos Externamente"
        nextLink="/requirement8_6"
        nextLabel="8.6 Libertação de Produtos e Serviços"
      />
    </>
  );
}

export default Requirement8_5;
