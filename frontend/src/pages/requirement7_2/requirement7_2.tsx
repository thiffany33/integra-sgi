import { Link } from "react-router-dom";
import { DownloadLink } from "@/components/downloadLink/downloadLink";
import { filesApi } from '@/api/files.api';
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement7_2() {
  return (
    <>
      <h1>7.2 Competência</h1>

      <Accordion title="O que é?">
        <p>
          A organização deve determinar as competências necessárias das
          pessoas que realizam atividades que podem afetar o desempenho
          e a eficácia do Sistema Integrado de Gestão.
        </p>

        <p>
          Também deve garantir que essas pessoas são competentes com base
          na educação, formação ou experiência adequadas.
        </p>

        <p>
          Quando forem identificadas necessidades de desenvolvimento,
          a organização deve tomar medidas para adquirir ou melhorar as
          competências necessárias e avaliar a eficácia dessas ações.
        </p>
      </Accordion>

      <Accordion title="Por que é importante?">
        <p>
          A competência das pessoas influencia diretamente a capacidade
          da organização para realizar os seus processos e alcançar os
          resultados pretendidos.
        </p>

        <p>
          Garantir que as pessoas possuem as competências necessárias
          permite reduzir erros, melhorar o desempenho dos processos e
          assegurar que as atividades são realizadas de forma adequada.
        </p>

        <p>
          Além disso, a organização deve conseguir demonstrar que as
          competências necessárias foram identificadas e que existem
          evidências das competências e das ações realizadas.
        </p>
      </Accordion>

      <Accordion title="Como implementar?">
        <p>
          A implementação deste requisito começa pela identificação das
          competências necessárias para cada função ou atividade relevante
          para o Sistema Integrado de Gestão.
        </p>

        <p>
          A organização deve comparar essas necessidades com as competências
          existentes e identificar eventuais lacunas.
        </p>

        <p>
          Quando existirem lacunas, podem ser definidas ações como:
        </p>

        <ul>
          <li>Formação;</li>
          <li>Acompanhamento ou orientação;</li>
          <li>Experiência prática;</li>
          <li>Alteração ou reforço das responsabilidades;</li>
          <li>Outras ações adequadas às necessidades identificadas.</li>
        </ul>

        <p>
          Após a realização dessas ações, deve ser avaliada a sua eficácia,
          de forma a verificar se a competência necessária foi efetivamente
          adquirida ou melhorada.
        </p>
      </Accordion>

      <Accordion title="Explicação do Requisito">
        <p>
          O requisito 7.2 está diretamente relacionado com a gestão das
          competências das pessoas que trabalham na organização.
        </p>

        <p>
          É importante distinguir duas questões: primeiro, a organização
          deve saber quais são as competências necessárias; depois, deve
          conseguir demonstrar que as pessoas possuem essas competências.
        </p>

        <p>
          Para isso, podem ser mantidas evidências como certificados,
          diplomas, registos de formação, avaliações de eficácia,
          comprovativos de experiência profissional ou outros documentos
          adequados.
        </p>

        <p>
          Estas evidências devem ser mantidas e controladas como
          informação documentada, sempre que aplicável.
        </p>

        <p>
          No Integra SIG, a identificação das competências e o planeamento
          das necessidades de formação são abordados no{" "}
          <Link to="/requirement5_2">
            Requisito 5.2 - Competência e Formação
          </Link>
          .
        </p>

        <p>
          Assim, não é necessário criar uma segunda matriz de competências
          neste requisito. O objetivo do 7.2 é garantir que as competências
          identificadas são demonstradas através de evidências adequadas
          e que essas evidências são devidamente mantidas e controladas.
        </p>
      </Accordion>

      <Accordion title="Gestão das Evidências de Competência">
        <p>
          A organização deve definir uma forma de guardar e controlar os
          documentos que comprovam as competências dos seus trabalhadores.
        </p>

        <p>
          Dependendo da organização, estas evidências podem ser mantidas
          em formato físico ou digital, desde que estejam protegidas,
          disponíveis quando necessárias e devidamente identificadas.
        </p>

        <p>
          Alguns exemplos de evidências incluem:
        </p>

        <ul>
          <li>Certificados de formação;</li>
          <li>Diplomas e qualificações;</li>
          <li>Registos de participação em formações;</li>
          <li>Registos de avaliação de competências;</li>
          <li>Comprovativos de experiência profissional;</li>
          <li>Registos de avaliação da eficácia da formação;</li>
          <li>Autorizações ou qualificações específicas para determinadas atividades.</li>
        </ul>

        <p>
          É importante garantir que estes documentos são atualizados,
          facilmente localizáveis e protegidos contra perda ou utilização
          indevida.
        </p>
        </Accordion>

        <Accordion title="Ferramentas de Apoio">
            <div>
                <h3>Plano de Formação</h3>

                <p>
                    O plano de formação permite organizar as ações de formação
                    necessárias para desenvolver ou atualizar as competências dos
                    trabalhadores.
                </p>

                <p>
                    Pode ser utilizado quando a organização identifica necessidades
                    de formação através da análise das competências necessárias,
                    da avaliação dos trabalhadores ou de alterações nos processos
                    e requisitos aplicáveis.
                </p>

                <div>
                    <DownloadLink
                        href={filesApi.templateDownloadUrl('training-plan')}
                        download
                    >Baixar Plano de formação</DownloadLink>
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
        previousLink="/requirement7_1"
        previousLabel="7.1 Recursos"
        nextLink="/requirement7_3"
        nextLabel="7.3 Consciencialização"
      />
    </>
  );
}

export default Requirement7_2;