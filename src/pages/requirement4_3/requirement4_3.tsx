import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement4_3() {
    return (
        <>

            <h1>
                4.3 Determinar o âmbito do sistema de gestão
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve definir os limites e a aplicabilidade do
                    Sistema Integrado de Gestão, determinando quais atividades,
                    produtos, serviços, unidades e processos fazem parte do sistema.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    O âmbito estabelece claramente o que está incluído no sistema
                    de gestão, evitando interpretações incorretas e garantindo
                    transparência para clientes, colaboradores e partes interessadas.
                </p>

            </Accordion>

            <Accordion title="Como Implementar?">

                <ul>

                    <li>
                        Identificar as atividades da organização.
                    </li>

                    <li>
                        Definir quais unidades, produtos e serviços serão abrangidos.
                    </li>

                    <li>
                        Considerar requisitos legais e das partes interessadas.
                    </li>

                    <li>
                        Documentar formalmente o âmbito do sistema.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <div>

                    <p>
                       O requisito 4.3 consiste em definir os limites do Sistema de Gestão. Nesta etapa, a organização determina exatamente o que será abrangido pelo sistema, considerando as suas atividades, processos, produtos, serviços e locais de atuação.
                       Para isso, devem ser analisados o contexto da organização, as necessidades das partes interessadas e os requisitos aplicáveis.
                       Um âmbito bem definido ajuda a garantir que o Sistema de Gestão é implementado de forma clara, consistente e adequada à realidade da organização
                    </p>

                </div>

            </Accordion>

            <Accordion title="Ferramentas de Apoio">

                <div>

                    <h3>
                        Modelo de Definição do Âmbito
                    </h3>

                    <div>

                        <a
                            href="/documents/requirement4/4_3/4_3_modelo_ambito.docx"
                            download
                        >
                            Download do Modelo
                        </a>

                    </div>

                </div>

            </Accordion>

            <Accordion title="Referência Oficial">

                <p>
                    Consulte a versão oficial da norma através do Instituto Português da Qualidade (IPQ).
                </p>

            </Accordion>

            <RequirementNavigation

                previousLink="/requirement4.2"
                previousLabel="Requisito 4.2"

                nextLink="/requirement4_4"
                nextLabel="4.4 Processos"

            /> 

        </>
    );
}

export default Requirement4_3;