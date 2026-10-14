import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_3() {
  return (
    <>
      <h1>8.3 Design e Desenvolvimento</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 8.3 está relacionado com o design e desenvolvimento de
          produtos e serviços, quando esse processo faz parte do âmbito da
          organização.
        </p>

        <p>
          Nem todas as organizações desenvolvem produtos ou serviços. Por
          isso, primeiro é necessário verificar se esta atividade existe
          realmente na organização.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>
          Quando a atividade existe, a organização deve controlar o processo
          desde a definição das necessidades até ao resultado final. De forma
          geral, isto envolve:
        </p>
        <ul>
          <li>planear o desenvolvimento;</li>
          <li>definir as entradas necessárias;</li>
          <li>estabelecer critérios e responsabilidades;</li>
          <li>realizar análises e verificações;</li>
          <li>avaliar os resultados;</li>
          <li>definir as saídas;</li>
          <li>controlar as alterações.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          Num sistema integrado, o design não deve considerar apenas a
          qualidade. Conforme a atividade, pode ser necessário considerar
          também:
        </p>
        <ul>
          <li>requisitos legais e do cliente;</li>
          <li>aspetos ambientais, consumo de recursos e produção de resíduos;</li>
          <li>perigos para a segurança e saúde de quem produz e de quem usa o produto;</li>
          <li>segurança dos alimentos, quando aplicável;</li>
          <li>ciclo de vida do produto;</li>
          <li>capacidade de produção;</li>
          <li>requisitos dos fornecedores.</li>
        </ul>

        <h3>Exemplo</h3>
        <p>
          Ao desenvolver uma nova embalagem para um alimento, a organização
          pode precisar de considerar ao mesmo tempo:
        </p>
        <ul>
          <li>Qualidade: a embalagem protege o produto?</li>
          <li>Segurança dos alimentos: existe risco de contaminação?</li>
          <li>Ambiente: qual é o impacto do material utilizado?</li>
          <li>Segurança e saúde no trabalho: a embalagem pode ser manuseada sem riscos para quem a produz?</li>
          <li>Cliente: a embalagem corresponde ao que foi pedido?</li>
          <li>Legislação: o material e a rotulagem cumprem os requisitos aplicáveis?</li>
        </ul>

        <p>
          O requisito 8.3 existe na ISO 9001. Na ISO 22000, o 8.3 trata da
          rastreabilidade, abordada aqui no requisito 8.5.
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
        previousLink="/requirement8_2"
        previousLabel="8.2 Requisitos Aplicáveis à Operação"
        nextLink="/requirement8_4"
        nextLabel="8.4 Controlo de Processos, Produtos e Serviços Fornecidos Externamente"
      />
    </>
  );
}

export default Requirement8_3;
