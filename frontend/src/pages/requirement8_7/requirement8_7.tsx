import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_7() {
  return (
    <>
      <h1>8.7 Controlo de Saídas Não Conformes</h1>

      <Accordion title="O que é?">
        <p>Nem tudo sai como planeado.</p>

        <p>
          Quando um produto, serviço ou resultado não cumpre os requisitos
          definidos, tem de ser identificado e controlado, para evitar que
          seja utilizado, entregue ou disponibilizado indevidamente.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>
          Uma empresa identifica que um lote tem uma característica fora da
          especificação. Não basta marcar "produto com problema": é necessário
          decidir o que fazer. Conforme a situação, pode ser necessário:
        </p>
        <ul>
          <li>corrigir;</li>
          <li>retrabalhar ou reprocessar;</li>
          <li>separar;</li>
          <li>rejeitar ou devolver;</li>
          <li>eliminar;</li>
          <li>obter autorização para uma utilização específica;</li>
          <li>informar o cliente;</li>
          <li>bloquear a entrega.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          Deve ficar registada a informação necessária sobre a não
          conformidade, a ação tomada e quem decidiu.
        </p>

        <p>
          Quando a não conformidade pode afetar a segurança dos alimentos,
          aplicam-se também os requisitos do 8.9.
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
        previousLink="/requirement8_6"
        previousLabel="8.6 Libertação de Produtos e Serviços"
        nextLink="/requirement8_8"
        nextLabel="8.8 Verificação dos Controlos de Segurança dos Alimentos"
      />
    </>
  );
}

export default Requirement8_7;
