import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_2() {
  return (
    <>
      <h1>8.2 Requisitos para Produtos e Serviços e Preparação para Emergências</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 8.2 tem o mesmo número em várias normas, mas trata temas
          diferentes conforme o sistema de gestão.
        </p>

        <p>
          Na ISO 9001, trata dos requisitos para produtos e serviços: perceber
          o que o cliente precisa antes de assumir um compromisso. Na ISO 14001
          e na ISO 45001, trata da preparação e resposta a emergências.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Confirmar os requisitos com o cliente antes de aceitar um pedido
          evita mal-entendidos, reclamações e trabalho repetido.
        </p>

        <p>
          Estar preparado para uma emergência, como um incêndio, um derrame
          ou um acidente, reduz os danos para as pessoas, para o ambiente e
          para a organização.
        </p>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <h3>Qualidade (ISO 9001): requisitos para produtos e serviços</h3>
        <ul>
          <li>Comunicar com os clientes: informar sobre os produtos e serviços, tratar pedidos e contratos e receber reclamações e opiniões.</li>
          <li>Determinar os requisitos: o que o cliente pede, o que é necessário para o uso pretendido e o que a lei exige.</li>
          <li>Rever os requisitos antes de aceitar o pedido, confirmando que a organização consegue cumpri-los.</li>
          <li>Quando os requisitos mudam, atualizar a informação e avisar as pessoas envolvidas.</li>
        </ul>

        <h3>Ambiente (ISO 14001): preparação e resposta a emergências</h3>
        <ul>
          <li>Identificar situações de emergência com impacto ambiental, como derrames, fugas ou incêndios.</li>
          <li>Planear a resposta e os meios necessários, como kits de contenção de derrames.</li>
          <li>Testar a resposta sempre que possível, por exemplo com simulacros.</li>
          <li>Rever a resposta depois de um simulacro ou de uma situação real.</li>
        </ul>

        <h3>Segurança e Saúde no Trabalho (ISO 45001): preparação e resposta a emergências</h3>
        <ul>
          <li>Identificar situações de emergência que possam afetar as pessoas, incluindo visitantes e trabalhadores externos.</li>
          <li>Definir a resposta, incluindo primeiros socorros, evacuação e contactos de emergência.</li>
          <li>Dar formação e informação a todos sobre o que fazer.</li>
          <li>Testar a resposta periodicamente e melhorá-la com o que se aprendeu.</li>
        </ul>

        <p>
          Num sistema integrado, a preparação para emergências pode ser um
          único plano que responde às duas normas, desde que considere tanto
          as pessoas como o ambiente.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li>Definir como são recebidos e confirmados os pedidos dos clientes.</li>
          <li>Verificar se a organização consegue cumprir o pedido antes de o aceitar.</li>
          <li>Listar as situações de emergência possíveis em cada local de trabalho.</li>
          <li>Definir quem faz o quê numa emergência e afixar os contactos úteis.</li>
          <li>Realizar simulacros e registar o que correu bem e o que deve melhorar.</li>
        </ul>
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
        nextLink="/requirement8_4"
        nextLabel="8.4 Controlo de Processos, Produtos e Serviços Fornecidos Externamente"
      />
    </>
  );
}

export default Requirement8_2;
