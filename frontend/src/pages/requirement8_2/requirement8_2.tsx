import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_2() {
  return (
    <>
      <h1>8.2 Requisitos Aplicáveis à Operação</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 8.2 trata dos requisitos que têm de ser considerados
          antes e durante a realização das atividades.
        </p>

        <p>
          Num sistema integrado, isto significa garantir que a organização
          compreende e controla os requisitos relevantes para aquilo que está
          a fazer.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Este requisito não é simplesmente receber o pedido. É garantir que
          aquilo que foi pedido pode ser corretamente cumprido e controlado.
        </p>

        <p>
          Também devem existir formas de comunicar, analisar os requisitos,
          tratar alterações e responder às situações aplicáveis ao tipo de
          organização, incluindo as emergências.
        </p>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>Os requisitos podem vir de:</p>
        <ul>
          <li>clientes;</li>
          <li>legislação e regulamentação;</li>
          <li>contratos;</li>
          <li>normas e especificações técnicas;</li>
          <li>requisitos internos;</li>
          <li>requisitos relacionados com o ambiente;</li>
          <li>requisitos de segurança e saúde no trabalho;</li>
          <li>requisitos relacionados com a segurança dos alimentos;</li>
          <li>outras partes interessadas.</li>
        </ul>

        <h3>Exemplo</h3>
        <p>
          Um cliente pede um produto com uma determinada especificação. Antes
          de aceitar o pedido, a organização deve verificar se:
        </p>
        <ul>
          <li>consegue produzir o produto;</li>
          <li>tem os recursos necessários;</li>
          <li>consegue cumprir o prazo;</li>
          <li>consegue cumprir a especificação;</li>
          <li>existem requisitos legais, ambientais ou de segurança dos alimentos;</li>
          <li>existem requisitos adicionais definidos pelo cliente.</li>
        </ul>
      </Accordion>

      <Accordion title="Aplicação nos diferentes sistemas">
        <h3>Qualidade (ISO 9001): requisitos para produtos e serviços</h3>
        <p>
          Comunicar com os clientes, determinar e rever os requisitos antes de
          assumir o compromisso e atualizar a informação quando os requisitos
          mudam.
        </p>

        <h3>Ambiente (ISO 14001): preparação e resposta a emergências</h3>
        <p>
          Identificar situações de emergência com impacto ambiental, como
          derrames, fugas ou incêndios, planear a resposta e testá-la, por
          exemplo com simulacros.
        </p>

        <h3>Segurança e Saúde no Trabalho (ISO 45001): preparação e resposta a emergências</h3>
        <p>
          Planear a resposta a emergências que possam afetar as pessoas,
          incluindo primeiros socorros e evacuação, dar formação a todos e
          testar a resposta periodicamente.
        </p>

        <h3>Segurança dos Alimentos (ISO 22000)</h3>
        <p>
          Na ISO 22000, o 8.2 trata dos programas de pré-requisitos (PPR),
          como higiene, limpeza e controlo de pragas. A preparação e resposta
          a emergências está no 8.4 desta norma.
        </p>

        <p>
          Num sistema integrado, a preparação para emergências pode ser um
          único plano, desde que considere as pessoas, o ambiente e, quando
          aplicável, a segurança dos alimentos.
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
        previousLink="/requirement8_1"
        previousLabel="8.1 Planeamento e Controlo Operacional"
        nextLink="/requirement8_3"
        nextLabel="8.3 Design e Desenvolvimento"
      />
    </>
  );
}

export default Requirement8_2;
