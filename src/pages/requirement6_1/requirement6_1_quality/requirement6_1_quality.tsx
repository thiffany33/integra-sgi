import Accordion from "../../../components/accordion/accordion";
import RequirementNavigation from "../../../components/requirementNavigation/requirementNavigation";

function Quality() {

    const systems = JSON.parse(
        localStorage.getItem("selectedSystems") || "{}"
    );

    return (
        <>

            <h1>
                6.1 Planeamento - Qualidade
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve identificar os riscos e oportunidades que
                    possam afetar o Sistema de Gestão da Qualidade e planear
                    ações para garantir que os resultados pretendidos sejam
                    alcançados.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    A identificação dos riscos e oportunidades permite reduzir a
                    probabilidade de falhas, aumentar a satisfação dos clientes
                    e melhorar continuamente o desempenho do Sistema de Gestão
                    da Qualidade.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Identificar riscos e oportunidades.
                    </li>

                    <li>
                        Avaliar o impacto de cada risco.
                    </li>

                    <li>
                        Definir ações para tratar riscos e oportunidades.
                    </li>

                    <li>
                        Integrar essas ações nos processos da organização.
                    </li>

                    <li>
                        Avaliar a eficácia das ações implementadas.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <p>
                    Este requisito tem como objetivo ajudar a organização a
                    antecipar problemas antes que eles aconteçam e aproveitar
                    oportunidades que possam melhorar os seus processos.
                </p>

                <p>
                    Para isso, é necessário identificar os riscos que podem
                    impedir o cumprimento dos objetivos da qualidade e definir
                    ações para reduzir ou eliminar esses riscos.
                </p>

                <p>
                    Da mesma forma, também devem ser identificadas oportunidades
                    que contribuam para melhorar os produtos, os serviços, os
                    processos ou a satisfação dos clientes. Todas essas ações
                    devem ser integradas no Sistema de Gestão da Qualidade e
                    acompanhadas para verificar se realmente produziram os
                    resultados esperados.
                </p>

            </Accordion>

            <Accordion title="Ferramentas de Apoio">

                <div>

                    <h3>
                        Matriz de Riscos e Oportunidades
                    </h3>

                    <div>

                        <a
                            href="/documents/requirement6/6_1/6_1_modelo_riscos_oportunidades.xlsx"
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

                previousLink="/requirement6"
                previousLabel="Requisito 6"

                nextLink={
                    systems.sga
                        ? "/requirement6_1_environment"
                        : systems.sgsst
                            ? "/requirement6_1_sst"
                            : "/requirement6_2"
                }

                nextLabel={
                    systems.sga
                        ? "6.1 Planeamento - Ambiente"
                        : systems.sgsst
                            ? "6.1 Planeamento - Segurança e Saúde no Trabalho"
                            : "6.2 Objetivos e Planeamento para os Alcançar"
                }

            />

        </>
    );
}

export default Quality;