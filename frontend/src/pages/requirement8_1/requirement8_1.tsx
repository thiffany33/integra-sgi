import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_1() {
  return (
    <>
      <h1>8.1 Planeamento e Controlo Operacional</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 8.1 estabelece a necessidade de planear, implementar e
          controlar os processos necessários para que as atividades da
          organização sejam realizadas de forma adequada.
        </p>

        <p>
          A organização deve determinar como os processos são executados,
          que critérios têm de ser cumpridos, que recursos são necessários,
          quem é responsável e que controlos devem ser aplicados.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Quando cada pessoa sabe o que fazer, como fazer e o que verificar,
          o trabalho torna-se mais previsível e os problemas são detetados
          mais cedo.
        </p>

        <p>
          Os controlos devem considerar os diferentes requisitos do sistema
          integrado, incluindo as ações definidas no requisito 6 para os
          riscos, os aspetos ambientais e os perigos.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>Para cada processo, a organização deve perguntar:</p>
        <ul>
          <li>O que fazemos?</li>
          <li>Como fazemos?</li>
          <li>O que precisa de ser controlado?</li>
          <li>Que requisitos têm de ser cumpridos?</li>
          <li>O que pode correr mal?</li>
          <li>Como vamos verificar se está tudo conforme?</li>
          <li>Que evidência precisamos de manter?</li>
        </ul>

        <p>
          O resultado pode ser um procedimento, uma instrução de trabalho,
          uma ficha de controlo, um plano, um formulário, uma especificação
          ou outro tipo de controlo adequado. A norma não exige um modelo
          específico.
        </p>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          O nível de controlo depende da realidade de cada organização. Uma
          atividade simples pode precisar apenas de uma regra clara; uma
          atividade com mais riscos pode precisar de instruções escritas,
          verificações e registos.
        </p>

        <h3>Qualidade (ISO 9001)</h3>
        <p>
          Definir os requisitos dos produtos e serviços, os critérios de
          aceitação e as verificações necessárias antes da entrega ao cliente.
        </p>

        <h3>Ambiente (ISO 14001)</h3>
        <p>
          Definir controlos para os aspetos ambientais significativos, como
          resíduos, consumos ou emissões, considerando o ciclo de vida do
          produto ou serviço.
        </p>

        <h3>Segurança e Saúde no Trabalho (ISO 45001)</h3>
        <p>
          Eliminar perigos e reduzir riscos, começando pela eliminação e pela
          substituição e deixando os equipamentos de proteção individual como
          última medida. As alterações e os trabalhos de empresas externas
          também devem ser controlados.
        </p>

        <h3>Segurança dos Alimentos (ISO 22000)</h3>
        <p>
          Quando aplicável, o controlo operacional inclui os programas de
          pré-requisitos (PPR), a análise de perigos e o plano de controlo de
          perigos, seguindo os princípios do HACCP.
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
        previousLink="/requirement8"
        previousLabel="Requisito 8 - Operacionalização"
        nextLink="/requirement8_2"
        nextLabel="8.2 Requisitos Aplicáveis à Operação"
      />
    </>
  );
}

export default Requirement8_1;
