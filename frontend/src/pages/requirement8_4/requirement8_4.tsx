import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from '@/api/files.api';
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement8_4() {
  return (
    <>
      <h1>8.4 Controlo de Processos, Produtos e Serviços Fornecidos Externamente</h1>

      <Accordion title="O que é?">
        <p>Nenhuma organização funciona completamente sozinha. Pode depender de:</p>
        <ul>
          <li>fornecedores e matérias-primas;</li>
          <li>transportadores;</li>
          <li>prestadores de serviços e empresas subcontratadas;</li>
          <li>equipamentos e manutenção externa;</li>
          <li>serviços especializados;</li>
          <li>outros processos realizados externamente.</li>
        </ul>

        <p>
          O requisito 8.4 estabelece a necessidade de controlar aquilo que é
          fornecido externamente quando pode afetar os resultados do sistema
          de gestão.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          Isto não significa tratar todos os fornecedores da mesma maneira. O
          nível de controlo deve ser adequado à importância e ao risco de cada
          fornecimento.
        </p>

        <p>
          Por exemplo, uma empresa alimentar pode contratar um fornecedor de
          matéria-prima, uma transportadora, uma empresa de limpeza, uma
          empresa de controlo de pragas e uma empresa de manutenção. Uma
          matéria-prima que entra diretamente no produto pode exigir controlos
          mais específicos do que um fornecedor de material de escritório.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <ul>
          <li><strong>Seleção:</strong> definir critérios para escolher os fornecedores.</li>
          <li><strong>Avaliação:</strong> verificar se o fornecedor cumpre os critérios.</li>
          <li><strong>Contratação:</strong> comunicar claramente os requisitos necessários.</li>
          <li><strong>Receção:</strong> verificar o que foi fornecido.</li>
          <li><strong>Monitorização:</strong> acompanhar o desempenho do fornecedor.</li>
          <li><strong>Reavaliação:</strong> verificar periodicamente se continua adequado.</li>
        </ul>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>Num sistema integrado, os critérios podem considerar ao mesmo tempo:</p>
        <ul>
          <li>qualidade;</li>
          <li>preço e prazo;</li>
          <li>requisitos legais;</li>
          <li>desempenho ambiental;</li>
          <li>segurança e saúde no trabalho;</li>
          <li>segurança dos alimentos;</li>
          <li>capacidade técnica;</li>
          <li>histórico de não conformidades;</li>
          <li>certificações, quando relevantes;</li>
          <li>riscos associados ao fornecimento.</li>
        </ul>

        <p>
          Na ISO 14001 e na ISO 45001, este controlo faz parte do controlo
          operacional (8.1): controlar os processos subcontratados, comunicar
          aos fornecedores os requisitos de ambiente e de segurança e garantir
          que os trabalhadores de empresas externas cumprem as regras da
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
        previousLink="/requirement8_3"
        previousLabel="8.3 Design e Desenvolvimento"
        nextLink="/requirement8_5"
        nextLabel="8.5 Produção e Prestação do Serviço"
      />
    </>
  );
}

export default Requirement8_4;
