import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Environment() {

    const systems = JSON.parse(
        localStorage.getItem("selectedSystems") || "{}"
    );

    return (

        <>

            <h1>
                6.1 Planeamento - Ambiente
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve identificar os aspetos ambientais das suas
                    atividades, produtos e serviços, avaliar os impactes
                    ambientais associados e determinar os riscos e oportunidades
                    que possam afetar o Sistema de Gestão Ambiental.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    A identificação dos aspetos e impactes ambientais permite à
                    organização prevenir a poluição, reduzir impactos negativos,
                    cumprir a legislação aplicável e melhorar continuamente o
                    desempenho ambiental.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Identificar os aspetos ambientais.
                    </li>

                    <li>
                        Avaliar os impactes ambientais.
                    </li>

                    <li>
                        Identificar requisitos legais aplicáveis.
                    </li>

                    <li>
                        Avaliar riscos e oportunidades ambientais.
                    </li>

                    <li>
                        Definir ações para controlar os impactes significativos.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="Importante">

                <p>
                    Um erro muito comum é considerar apenas os aspetos ambientais
                    normais da organização. Durante uma auditoria também são
                    avaliadas situações anormais e potenciais situações de
                    emergência que possam causar impactes ambientais.
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
                        Matriz de Aspetos Ambientais
                    </h3>

                    <div>

                        <a
                            href="/documents/requirement6/6_1/6_1_modelo_aspetos_ambiental.xlsx"
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

                previousLink={
                    systems.sgq
                        ? "/requirement6_1_quality"
                        : "/requirement6"
                }

                previousLabel={
                    systems.sgq
                        ? "6.1 Planeamento - Qualidade"
                        : "Requisito 6"
                }

                nextLink={
                    systems.sgsst
                        ? "/requirement6_1_sst"
                        : "/requirement6_2"
                }

                nextLabel={
                    systems.sgsst
                        ? "6.1 Planeamento - Segurança e Saúde no Trabalho"
                        : "6.2 Objetivos e Planeamento"
                }

            />

        </>

    );

}

export default Environment;