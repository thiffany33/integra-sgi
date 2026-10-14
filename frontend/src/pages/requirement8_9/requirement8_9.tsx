import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_9() {
  return (
    <>
      <h1>8.9 Controlo de Não Conformidades de Produto e Processo</h1>

      <Accordion title="O que é?">
        <p>
          No contexto da segurança dos alimentos, o controlo das não
          conformidades tem requisitos adicionais aos do 8.7.
        </p>

        <p>
          A ISO 22000 organiza este controlo no requisito 8.9, incluindo
          correções, ações corretivas, tratamento de produtos potencialmente
          não seguros e retirada ou recolha do mercado.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>
          Quando um desvio pode afetar a segurança de um alimento, a
          organização deve determinar:
        </p>
        <ul>
          <li>que produto foi afetado;</li>
          <li>que processo apresentou o problema;</li>
          <li>se o produto deve ser bloqueado;</li>
          <li>se pode ser libertado;</li>
          <li>se deve ser reprocessado;</li>
          <li>se deve ser eliminado;</li>
          <li>se é necessário retirar ou recolher o produto do mercado;</li>
          <li>que ações corretivas devem ser tomadas.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          A rastreabilidade descrita no requisito 8.5 é essencial aqui: é ela
          que permite saber que lotes foram afetados e a que clientes chegaram.
        </p>

        <p>
          As decisões e as ações tomadas devem ficar registadas como
          informação documentada.
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
        previousLink="/requirement8_8"
        previousLabel="8.8 Verificação dos Controlos de Segurança dos Alimentos"
        nextLink="/requirement"
        nextLabel="Voltar ao guia de gestão"
      />
    </>
  );
}

export default Requirement8_9;
