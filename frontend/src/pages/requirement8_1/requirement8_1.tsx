import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_1() {
  return (
    <>
      <h1>8.1 Planeamento e Controlo Operacional</h1>

      <Accordion title="O que é?">
        <p>
          A organização deve planear, realizar e controlar as atividades
          necessárias para entregar os seus produtos e serviços e para gerir
          os riscos identificados no planeamento.
        </p>

        <p>
          Isto inclui definir como o trabalho deve ser feito, que resultado se
          espera e que verificações são necessárias para confirmar que tudo
          correu como planeado.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Quando cada pessoa sabe o que fazer, como fazer e o que verificar,
          o trabalho torna-se mais previsível. Os erros são detetados mais
          cedo e é mais fácil corrigir problemas antes de chegarem ao cliente,
          ao ambiente ou aos trabalhadores.
        </p>

        <p>
          O controlo operacional é também a forma de pôr em prática as ações
          definidas para os riscos, os aspetos ambientais e os perigos
          identificados no requisito 6.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li>Partir das atividades e processos identificados no requisito 4.4.</li>
          <li>Definir, para cada atividade, o que é um resultado aceitável.</li>
          <li>Definir as verificações e os controlos necessários.</li>
          <li>Garantir que existem os recursos necessários, como pessoas, equipamentos e materiais.</li>
          <li>Guardar os registos que mostram que as atividades foram feitas como planeado.</li>
          <li>Planear as alterações antes de as fazer e analisar os efeitos de alterações não previstas.</li>
          <li>Garantir que as atividades feitas por terceiros também são controladas.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          O nível de controlo depende da realidade de cada organização. Uma
          atividade simples e bem conhecida pode precisar apenas de uma regra
          clara. Uma atividade com mais riscos pode precisar de instruções
          escritas, verificações e registos.
        </p>

        <p>
          Num sistema integrado, o mesmo controlo pode responder a várias
          normas ao mesmo tempo. Por exemplo, uma instrução de trabalho pode
          indicar como fazer a tarefa com qualidade, como evitar desperdício e
          que equipamento de proteção usar.
        </p>

        <h3>Qualidade (ISO 9001)</h3>
        <p>
          Definir os requisitos dos produtos e serviços, os critérios de
          aceitação e as verificações necessárias antes da entrega ao cliente.
        </p>

        <h3>Ambiente (ISO 14001)</h3>
        <p>
          Definir controlos para os aspetos ambientais significativos, como
          resíduos, consumos de energia e água ou emissões, considerando as
          várias fases do ciclo de vida do produto ou serviço.
        </p>

        <h3>Segurança e Saúde no Trabalho (ISO 45001)</h3>
        <p>
          Eliminar perigos e reduzir riscos, dando prioridade à eliminação,
          depois à substituição, aos meios de proteção coletiva, às medidas de
          organização e, por fim, aos equipamentos de proteção individual.
          As alterações e os trabalhos feitos por empresas externas também
          devem ser controlados.
        </p>

        <p>
          A norma não exige um modelo específico para este requisito. Use os
          documentos e registos que já fazem sentido na sua organização.
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
        previousLabel="Requisito 8 - Operação"
        nextLink="/requirement8_2"
        nextLabel="8.2 Requisitos para Produtos e Serviços e Preparação para Emergências"
      />
    </>
  );
}

export default Requirement8_1;
