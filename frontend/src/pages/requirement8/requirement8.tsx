import { Link } from "react-router-dom";
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

const stages = [
  ["/requirement8_1", "8.1 — Planear e controlar", "Definir como os processos são realizados e controlados."],
  ["/requirement8_2", "8.2 — Determinar requisitos", "Identificar e analisar os requisitos aplicáveis às atividades."],
  ["/requirement8_3", "8.3 — Desenvolver", "Controlar o design e desenvolvimento, quando aplicável."],
  ["/requirement8_4", "8.4 — Controlar externos", "Controlar fornecedores, produtos, serviços e processos externos."],
  ["/requirement8_5", "8.5 — Executar", "Realizar a produção ou a prestação do serviço em condições controladas."],
  ["/requirement8_6", "8.6 — Libertar", "Verificar se o resultado cumpre os critérios antes de o disponibilizar."],
  ["/requirement8_7", "8.7 — Controlar desvios", "Impedir que resultados não conformes sejam utilizados ou entregues."],
  ["/requirement8_8", "8.8 — Verificar controlos", "Confirmar que os controlos funcionam, sobretudo na segurança dos alimentos."],
  ["/requirement8_9", "8.9 — Tratar não conformidades", "Controlar produtos e processos não conformes e decidir o que fazer."],
] as const;

function Requirement8() {
  return (
    <>
      <h1>Requisito 8 - Operacionalização</h1>

      <Accordion title="O que é?">
        <p>
          O requisito 8 é a parte do Sistema Integrado de Gestão em que a
          organização põe em prática aquilo que planeou.
        </p>

        <p>
          Os processos devem ser realizados e controlados de forma a cumprir
          os requisitos de qualidade, ambiente, segurança e saúde no trabalho,
          segurança dos alimentos, requisitos legais, dos clientes e de outras
          partes interessadas, conforme aplicável.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          É no dia a dia que o sistema de gestão acontece. A organização
          deixa de apenas planear e passa a executar, controlar, verificar e
          tratar os resultados dos seus processos.
        </p>

        <p>
          O resultado esperado é uma operação planeada, controlada, rastreável
          e capaz de responder aos desvios.
        </p>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          Num sistema integrado, os controlos devem fazer parte dos processos
          que já existem. Por exemplo, um processo de produção pode envolver
          ao mesmo tempo:
        </p>

        <ul>
          <li>requisitos do produto e do cliente;</li>
          <li>controlo de fornecedores e de equipamentos;</li>
          <li>aspetos ambientais e resíduos;</li>
          <li>perigos para a segurança e saúde dos trabalhadores;</li>
          <li>perigos para a segurança dos alimentos, quando aplicável;</li>
          <li>requisitos legais;</li>
          <li>rastreabilidade;</li>
          <li>tratamento de produtos não conformes.</li>
        </ul>

        <p>
          O objetivo não é criar um processo separado para cada norma, mas
          incorporar os requisitos aplicáveis no processo que já existe.
        </p>

        <p>
          A estrutura do capítulo varia conforme a norma. A ISO 14001 e a
          ISO 45001 terminam o requisito 8 no 8.2. A ISO 9001 vai até ao 8.7.
          Os requisitos 8.8 e 8.9 seguem a estrutura própria da ISO 22000,
          para a segurança dos alimentos.
        </p>
      </Accordion>

      <Accordion title="Sub-requisitos">
        <ul>
          {stages.map(([path, title, description]) => (
            <li key={path}>
              <Link to={path}>{title}</Link>: {description}
            </li>
          ))}
        </ul>
      </Accordion>

      <Accordion title="E onde entra o HACCP?">
        <p>
          Quando a organização trabalha com segurança dos alimentos, o HACCP
          faz parte do controlo operacional do sistema de gestão, e não é um
          sistema separado. A ISO 22000 integra os princípios do HACCP.
        </p>

        <p>Nesse caso, o controlo operacional pode seguir esta sequência:</p>

        <ol className="mb-5 list-decimal space-y-3 pl-6">
          <li>Identificação dos perigos.</li>
          <li>Análise dos perigos.</li>
          <li>Definição das medidas de controlo.</li>
          <li>Determinação dos PCC e PPRO, quando aplicável.</li>
          <li>Definição dos critérios de controlo.</li>
          <li>Monitorização.</li>
          <li>Correção quando ocorre um desvio.</li>
          <li>Verificação.</li>
          <li>Registos e evidências.</li>
        </ol>
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
