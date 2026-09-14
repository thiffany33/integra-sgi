import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement7() {
  return (
    <>
      <h1>Requisito 7 - Suporte</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 7 estabelece os recursos e as condições necessárias
          para apoiar o funcionamento do Sistema Integrado de Gestão.
        </p>

        <p>
          Este requisito aborda temas como recursos, competência,
          consciencialização, comunicação e informação documentada.
        </p>

        <p>
          O objetivo é garantir que a organização possui as pessoas,
          conhecimentos, recursos e informações necessários para que o
          sistema de gestão funcione de forma eficaz.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Um sistema de gestão não funciona apenas através de procedimentos
          e documentos. É necessário garantir que existem recursos adequados,
          pessoas competentes e informação disponível para apoiar os processos
          da organização.
        </p>

        <p>
          O cumprimento deste requisito permite melhorar a organização interna,
          reduzir falhas, garantir a disponibilidade de informação e assegurar
          que os trabalhadores compreendem as suas responsabilidades.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li>Determinar e disponibilizar os recursos necessários.</li>
          <li>Garantir que as pessoas possuem as competências necessárias.</li>
          <li>Promover a consciencialização dos trabalhadores.</li>
          <li>Definir os processos de comunicação relevantes.</li>
          <li>Controlar a informação documentada do sistema de gestão.</li>
          <li>
            Garantir que os documentos e registos necessários estão disponíveis
            e protegidos.
          </li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          O requisito 7 funciona como uma base de suporte para os restantes
          processos do Sistema Integrado de Gestão.
        </p>

        <p>
          A organização deve garantir que possui os recursos necessários para
          implementar, manter e melhorar o sistema. Esses recursos podem incluir
          pessoas, infraestruturas, equipamentos, tecnologia, recursos de
          monitorização e medição e conhecimento organizacional.
        </p>

        <p>
          Também é necessário garantir que as pessoas que realizam atividades
          que podem afetar o desempenho do sistema possuem a competência
          adequada e conhecem a importância das suas atividades.
        </p>

        <p>
          A comunicação deve ser planeada para garantir que a informação
          relevante chega às pessoas certas, no momento adequado e através dos
          meios apropriados.
        </p>

        <p>
          Por fim, a organização deve controlar a informação documentada
          necessária para o funcionamento do sistema de gestão, garantindo que
          esta é criada, atualizada, disponibilizada e protegida de forma
          adequada.
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
        previousLink="/requirement6_2"
        previousLabel="6.2 Objetivos e Planeamento para os Alcançar"
        nextLink="/requirement7_1"
        nextLabel="7.1 Recursos"
      />
    </>
  );
}

export default Requirement7;