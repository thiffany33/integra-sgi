import { Link } from "react-router-dom";
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8() {
  return (
    <>
      <h1>Requisito 8 - Operação</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 8 trata da forma como a organização realiza o seu
          trabalho do dia a dia: como planeia e controla as atividades, como
          responde aos clientes e a situações de emergência e como acompanha
          os fornecedores e prestadores de serviços externos.
        </p>

        <p>
          É neste requisito que o que foi planeado nos capítulos anteriores
          passa à prática.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Os resultados da organização dependem da forma como as atividades
          são realizadas. Quando o trabalho é planeado e controlado, há menos
          erros, menos atrasos, menos desperdício e menos acidentes.
        </p>

        <p>
          Este requisito ajuda também a garantir que aquilo que é comprado ou
          feito por terceiros cumpre o que a organização precisa.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li>Identificar as atividades principais da organização.</li>
          <li>Definir como cada atividade deve ser feita e o que é um bom resultado.</li>
          <li>Definir os controlos necessários e quem é responsável por eles.</li>
          <li>Conhecer os requisitos dos clientes antes de assumir um compromisso.</li>
          <li>Preparar a resposta a possíveis situações de emergência.</li>
          <li>Escolher, avaliar e acompanhar os fornecedores externos.</li>
          <li>Guardar os registos que mostram que as atividades foram realizadas como planeado.</li>
        </ul>
      </Accordion>

      <Accordion title="Sub-requisitos">
        <ul>
          <li><Link to="/requirement8_1">8.1 Planeamento e Controlo Operacional</Link></li>
          <li><Link to="/requirement8_2">8.2 Requisitos para Produtos e Serviços e Preparação para Emergências</Link></li>
          <li><Link to="/requirement8_4">8.4 Controlo de Processos, Produtos e Serviços Fornecidos Externamente</Link></li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          O capítulo 8 tem o mesmo número nas normas ISO 9001, ISO 14001 e
          ISO 45001, mas o seu conteúdo varia conforme o sistema. Em todas,
          começa pelo planeamento e controlo operacional (8.1). Depois, cada
          norma trata temas próprios: a ISO 9001 aborda os requisitos dos
          produtos e serviços, enquanto a ISO 14001 e a ISO 45001 abordam a
          preparação e resposta a emergências (8.2).
        </p>

        <p>
          O controlo dos fornecedores externos (8.4 na ISO 9001) também é
          tratado nas normas de ambiente e de segurança e saúde no trabalho,
          dentro do controlo operacional e das compras.
        </p>

        <p>
          O requisito 8.3, sobre conceção e desenvolvimento, existe apenas na
          ISO 9001 e aplica-se quando a organização concebe os seus próprios
          produtos ou serviços. Não está incluído neste guia.
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
        previousLink="/requirement7_5"
        previousLabel="7.5 Informação Documentada"
        nextLink="/requirement8_1"
        nextLabel="8.1 Planeamento e Controlo Operacional"
      />
    </>
  );
}

export default Requirement8;
