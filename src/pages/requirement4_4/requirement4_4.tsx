import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement4_4() {
    return (
        <>

            <h1>
                4.4 Sistema de gestão e seus processos
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve estabelecer, implementar, manter e melhorar
                    continuamente os processos necessários para o funcionamento do
                    Sistema Integrado de Gestão.
                </p>

                <p>
                    Os processos devem ser identificados, documentados quando
                    necessário e geridos de forma a garantir que os resultados
                    pretendidos são alcançados.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    A gestão por processos permite compreender como as atividades
                    da organização se relacionam, identificar oportunidades de
                    melhoria, reduzir falhas e aumentar a eficiência do sistema
                    de gestão.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Identificar todos os processos da organização.
                    </li>

                    <li>
                        Definir entradas, saídas, responsáveis e recursos.
                    </li>

                    <li>
                        Identificar a interação entre os processos.
                    </li>

                    <li>
                        Monitorizar e melhorar continuamente os processos.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <div>

                    <p>
                        O requisito 4.4 consiste em organizar o funcionamento do Sistema de Gestão através dos seus processos.
                        Nesta etapa, a organização identifica as atividades necessárias para o seu funcionamento, define como cada processo é executado, quem é responsável por cada um, quais os recursos necessários e como será avaliado o seu desempenho.
                        Um sistema baseado em processos facilita a organização das atividades, melhora o controlo, reduz falhas e contribui para a melhoria contínua da organização.
                    </p>

                </div>

            </Accordion>

            <Accordion title="Guias de Elaboração">

                <div>

                    <h3>
                        Matriz e Mapa de Processos
                    </h3>

                    <div>

                        <a
                            href="/documents/requirement4/4_4-/modelo_mapa_de_processos.xlsx"
                            download
                        >
                            Download do Modelo
                        </a>

                    </div>
                </div>


                <div>

                    <h3>
                        Cadeia de Valor
                    </h3>

                    <div>
                        <a
                            href="/documents/requirement4/4_4/4_4_modelo_cadeia_de_valor.xlsx"
                            download
                        >
                            Download do Modelo
                        </a>

                    </div>

                </div>


                <div>

                    <h3>
                        Fluxograma
                    </h3>

                    <div>

                        <div>

                        <a
                            href="/documents/requirement4/4_4/4_4_modelo_fluxograma.xlsx"
                            download
                        >
                            Download do Modelo
                        </a>

                    </div>

                    </div>

                </div>

            </Accordion>

            <Accordion title="Referência Oficial">

                <p>
                    Consulte a versão oficial da norma através do Instituto Português da Qualidade (IPQ).
                </p>

            </Accordion>

            <RequirementNavigation

                previousLink="/requirement4_3"
                previousLabel="Requisito 4.3"

                nextLink="/requirement5"
                nextLabel="5 - Liderança"
            /> 

        </>
    );
}

export default Requirement4_4;