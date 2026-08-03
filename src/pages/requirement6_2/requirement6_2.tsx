import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement6_2() {
    return (
        <>

            <h1>
                6.2 Objetivos e Planeamento para os Alcançar
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve estabelecer objetivos para o Sistema
                    Integrado de Gestão e definir um plano para garantir que esses
                    objetivos sejam alcançados.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    Os objetivos permitem orientar as ações da organização,
                    acompanhar o desempenho do sistema de gestão e promover a
                    melhoria contínua através de resultados mensuráveis.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Definir objetivos claros e mensuráveis.
                    </li>

                    <li>
                        Estabelecer indicadores para acompanhar os resultados.
                    </li>

                    <li>
                        Definir responsáveis por cada objetivo.
                    </li>

                    <li>
                        Identificar os recursos necessários.
                    </li>

                    <li>
                        Definir prazos para implementação.
                    </li>

                    <li>
                        Monitorizar periodicamente o progresso.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <p>
                    Depois de identificar os riscos e oportunidades, a
                    organização deve estabelecer objetivos que contribuam para a
                    melhoria do seu Sistema Integrado de Gestão.
                </p>

                <p>
                    Estes objetivos devem estar alinhados com a política da
                    organização, ser mensuráveis sempre que possível e ser
                    acompanhados ao longo do tempo para verificar se estão a ser
                    alcançados.
                </p>

                <p>
                    Para cada objetivo é importante definir quem será o
                    responsável, quais os recursos necessários, o prazo para
                    conclusão e a forma como os resultados serão avaliados.
                </p>

                <p>
                    O acompanhamento periódico destes objetivos permite
                    identificar desvios, implementar ações corretivas quando
                    necessário e promover a melhoria contínua do Sistema
                    Integrado de Gestão.
                </p>

            </Accordion>

            <Accordion title="Ferramentas de Apoio">

                <div>

                    <h3>
                        Plano de Objetivos
                    </h3>

                    <div>

                        <a
                            href="/documents/requirement6/6_2/6_2_modelo_objetivos.xlsx"
                            download
                        >
                            Download do Modelo
                        </a>

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
                    </a>

                    .

                </p>

            </Accordion>

            <RequirementNavigation

                previousLink="/requirement6_1_sst"
                previousLabel="6.1 Planeamento - Segurança e Saúde no Trabalho"

                nextLink="/requirement7"
                nextLabel="Requisito 7 - Suporte"

            />

        </>
    );
}

export default Requirement6_2;