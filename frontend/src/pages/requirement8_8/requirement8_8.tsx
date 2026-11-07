import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_8() {
  return (
    <>
      <h1>8.8 Verificação dos Controlos de Segurança dos Alimentos</h1>

      <Accordion title="O que é?">
        <p>
          Este requisito aplica-se quando o sistema de gestão inclui a
          segurança dos alimentos. Na ISO 22000, o requisito 8 continua para
          além do 8.7 e chega ao 8.9, porque a norma tem uma estrutura
          operacional própria.
        </p>

        <p>
          A ideia é simples: não basta estabelecer controlos, é necessário
          verificar se esses controlos estão a funcionar.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>A verificação pode envolver:</p>
        <ul>
          <li>verificação dos programas de pré-requisitos (PPR);</li>
          <li>verificação dos controlos dos perigos;</li>
          <li>verificação das monitorizações;</li>
          <li>análise dos resultados;</li>
          <li>confirmação de que os controlos continuam adequados.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <h3>Exemplo</h3>
        <p>
          A organização definiu um procedimento de higienização. Não basta ter
          o procedimento. É necessário verificar se:
        </p>
        <ul>
          <li>a higienização está a ser feita;</li>
          <li>o método definido está a ser seguido;</li>
          <li>o resultado é adequado;</li>
          <li>os registos estão a ser preenchidos;</li>
          <li>o controlo continua eficaz.</li>
        </ul>

        <p>
          Os requisitos 8.8 e 8.9 não continuam a estrutura da ISO 9001.
          Correspondem à estrutura operacional da ISO 22000.
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
        previousLink="/requirement8_7"
        previousLabel="8.7 Controlo de Saídas Não Conformes"
        nextLink="/requirement8_9"
        nextLabel="8.9 Controlo de Não Conformidades de Produto e Processo"
      />
    </>
  );
}

export default Requirement8_8;
