import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement7_5() {
  return (
    <>
      <h1>7.5 Informação Documentada</h1>

      <Accordion title="O que é?">
        <p>
          A informação documentada corresponde às informações que a organização
          necessita de manter e controlar para garantir o funcionamento do
          Sistema Integrado de Gestão.
        </p>

        <p>
          Esta informação pode incluir documentos, procedimentos, instruções,
          políticas, formulários, registos e outros documentos necessários para
          apoiar os processos da organização.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          O controlo da informação documentada permite garantir que as pessoas
          utilizam informação correta e atualizada e que os registos necessários
          são preservados como evidência das atividades realizadas.
        </p>

        <p>
          Um bom controlo documental também reduz o risco de utilização de
          documentos obsoletos, perda de informação ou utilização de versões
          incorretas.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li>Identificar a informação documentada necessária.</li>
          <li>Definir como os documentos são criados e aprovados.</li>
          <li>Controlar as versões dos documentos.</li>
          <li>
            Garantir que os documentos estão disponíveis quando necessários.
          </li>
          <li>Proteger a informação contra perda ou utilização indevida.</li>
          <li>Controlar alterações aos documentos.</li>
          <li>Evitar a utilização não intencional de documentos obsoletos.</li>
          <li>Definir períodos de retenção para os registos aplicáveis.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          A organização deve determinar quais são os documentos e registos
          necessários para garantir o funcionamento do Sistema Integrado de
          Gestão e para demonstrar que os requisitos estão a ser cumpridos.
        </p>

        <p>
          Os documentos podem incluir políticas, procedimentos, instruções de
          trabalho, planos, formulários e outros documentos utilizados para
          orientar a realização das atividades.
        </p>

        <p>
          Os registos funcionam como evidências de que determinadas atividades
          foram realizadas. Exemplos incluem registos de formação, resultados de
          monitorização, inspeções, auditorias e avaliações.
        </p>

        <p>
          A organização deve controlar esta informação durante todo o seu ciclo
          de vida, desde a criação ou receção até à atualização, distribuição,
          armazenamento, retenção e eliminação.
        </p>

        <p>
          O controlo deve garantir que a informação correta está disponível para
          quem necessita dela e que os documentos obsoletos não são utilizados
          de forma não intencional.
        </p>
      </Accordion>

      <Accordion title="Ferramentas de Apoio">

        <div>
          <h3>Controlo de Documentos</h3>

          <div>
            <a
              href="/documents/requirement7/7_5_modelo_controlo_documental.xlsx"
              download
            >Ç
              Download do Modelo
            </a>
          </div>
        </div>
      </Accordion>

      <Accordion title="Referência Oficial">
        <p>
          Consulte a versão oficial da norma através do{" "}
          <a href="https://www.ipq.pt" target="_blank" rel="noreferrer">
            Instituto Português da Qualidade (IPQ)
          </a>
          .
        </p>
      </Accordion>

      <RequirementNavigation
        previousLink="/requirement7_4"
        previousLabel="7.4 Comunicação"
        nextLink="/requirement8"
        nextLabel="Requisito 8 - Operacionalização"
      />
    </>
  );
}

export default Requirement7_5;
