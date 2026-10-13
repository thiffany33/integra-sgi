import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from '@/api/files.api';
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_4() {
  return (
    <>
      <h1>8.4 Controlo de Processos, Produtos e Serviços Fornecidos Externamente</h1>

      <Accordion title="O que é?">
        <p>
          Muitas organizações dependem de fornecedores e prestadores de
          serviços externos, por exemplo para materiais, transportes,
          manutenção, limpeza ou contabilidade.
        </p>

        <p>
          Este requisito pede que a organização garanta que aquilo que é
          comprado ou feito por terceiros cumpre o que ela precisa.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Um material com defeito, um serviço atrasado ou um prestador que não
          cumpre regras de segurança ou ambientais afeta diretamente a
          organização e os seus clientes.
        </p>

        <p>
          Escolher bem os fornecedores e acompanhá-los ao longo do tempo
          reduz estes problemas e ajuda a decidir com quem continuar a
          trabalhar.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li>Listar os fornecedores e prestadores que afetam os produtos, os serviços, o ambiente ou a segurança.</li>
          <li>Definir critérios para os escolher, avaliar e voltar a avaliar, como qualidade, prazos, preço, segurança e cuidado ambiental.</li>
          <li>Avaliar cada fornecedor com esses critérios e registar o resultado.</li>
          <li>Comunicar ao fornecedor o que se espera dele, incluindo regras de segurança e de ambiente.</li>
          <li>Verificar o que é recebido antes de o usar ou entregar ao cliente.</li>
          <li>Voltar a avaliar os fornecedores periodicamente e decidir o que fazer quando há problemas.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          O controlo deve ser proporcional à importância de cada fornecedor.
          Um fornecedor de material de escritório pode precisar apenas de uma
          avaliação simples. Um fornecedor de uma peça essencial ou uma
          empresa que trabalha nas instalações da organização precisa de um
          acompanhamento maior.
        </p>

        <h3>Qualidade (ISO 9001)</h3>
        <p>
          Garantir que os produtos e serviços externos cumprem os requisitos
          e não afetam a capacidade de entregar ao cliente o que foi acordado.
        </p>

        <h3>Ambiente (ISO 14001)</h3>
        <p>
          Controlar ou influenciar os processos feitos por terceiros e
          comunicar aos fornecedores os requisitos ambientais relevantes, como
          a gestão de resíduos.
        </p>

        <h3>Segurança e Saúde no Trabalho (ISO 45001)</h3>
        <p>
          Considerar a segurança nas compras e garantir que os trabalhadores
          de empresas externas conhecem e cumprem as regras de segurança da
          organização.
        </p>
      </Accordion>

      <Accordion title="Ferramentas de Apoio">
        <div>
          <h3>Avaliação de Fornecedores</h3>

          <p>
            O modelo de avaliação de fornecedores ajuda a registar os
            critérios, o resultado de cada avaliação e as decisões tomadas.
          </p>

          <div>
            <DownloadLink
              href={filesApi.templateDownloadUrl('supplier-evaluation')}
              download
            >Baixar Avaliação de fornecedores</DownloadLink>
          </div>
        </div>
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
        previousLink="/requirement8_2"
        previousLabel="8.2 Requisitos para Produtos e Serviços e Preparação para Emergências"
        nextLink="/requirement"
        nextLabel="Voltar ao guia de gestão"
      />
    </>
  );
}

export default Requirement8_4;
