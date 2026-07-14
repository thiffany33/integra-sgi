import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

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
                    A organização deve identificar riscos e oportunidades que
                    possam afetar o Sistema de Gestão da Qualidade, planeando
                    ações para prevenir efeitos indesejados e melhorar o
                    desempenho do sistema.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    A identificação dos riscos e oportunidades permite aumentar a
                    confiança nos resultados do sistema de gestão, reduzir falhas
                    e promover a melhoria contínua.
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

            <Accordion title="💡 Dica do Auditor">

                <p>
                    A ISO 9001 não exige uma metodologia específica para avaliar
                    riscos. O mais importante é que a organização demonstre que
                    identificou os riscos relevantes, planeou ações e acompanha a
                    eficácia dessas ações.
                </p>

            </Accordion>

            <Accordion title="Vídeo Explicativo">

                <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                >
                    Assistir vídeo explicativo
                </a>

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

                    <div>

                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Vídeo Explicativo do Modelo
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