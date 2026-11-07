import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_6() {
  return (
    <>
      <h1>8.6 Libertação de Produtos e Serviços</h1>

      <Accordion title="O que é?">
        <p>
          Antes de entregar um produto ou disponibilizar um serviço, a
          organização deve verificar se os critérios definidos foram
          cumpridos.
        </p>

        <p>
          Não basta terminar o processo. É necessário verificar se o resultado
          está conforme antes de o libertar.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>Uma indústria produz um lote. Antes da libertação, pode verificar:</p>
        <ul>
          <li>quantidade;</li>
          <li>especificações;</li>
          <li>resultados de inspeção;</li>
          <li>parâmetros do processo;</li>
          <li>requisitos de segurança;</li>
          <li>documentação;</li>
          <li>critérios definidos pelo cliente.</li>
        </ul>

        <p>O produto só é libertado depois de os critérios necessários serem cumpridos.</p>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          Deve existir evidência adequada de que o produto ou serviço está
          conforme com os critérios de aceitação e, quando aplicável, de quem
          autorizou a libertação.
        </p>

        <p>
          Estes registos devem ser mantidos como informação documentada,
          conforme definido no requisito 7.5.
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
        previousLink="/requirement8_5"
        previousLabel="8.5 Produção e Prestação do Serviço"
        nextLink="/requirement8_7"
        nextLabel="8.7 Controlo de Saídas Não Conformes"
      />
    </>
  );
}

export default Requirement8_6;
