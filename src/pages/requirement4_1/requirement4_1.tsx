import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement4_1() {
    return (
        <>
            <h1>
                4.1 Compreender a organização e o seu contexto
            </h1>

            <Accordion title="O que é?">
                <p>
                    A organização deve compreender os fatores internos
                    e externos que influenciam o sistema de gestão.
                </p>
            </Accordion>

            <Accordion title="Por que é importante">
                <p>
                    Permite identificar riscos, oportunidades
                    e fatores que podem impactar os objetivos.
                </p>
            </Accordion>

            <Accordion title="Como Implementar?">
                <ul>

                    <li>Identificar fatores internos.</li>

                    <li>Identificar fatores externos.</li>

                    <li>Avaliar riscos e oportunidades.</li>

                </ul>
            </Accordion>

            <Accordion title="Explicação do Requisito">

                <div>

                    <p>
                        O requisito 4.1 consiste em analisar a realidade da organização. 
                        Antes de implementar um Sistema de Gestão, é importante compreender os fatores internos (como recursos, estrutura e cultura organizacional)
                        e os fatores externos (como legislação, mercado, concorrência e economia) que podem influenciar as suas atividades.
                        Esta análise permite identificar riscos e oportunidades, apoiar a tomada de decisões e garantir que o Sistema de Gestão está adequado ao contexto em que a organização atua.
                    </p>

                </div>

            </Accordion>

            <Accordion title="Ferramentas de Apoio">

                <div>

                    <h3>
                        Modelo SWOT
                    </h3>

                    <div>

                        <a
                            href="/documents/requirement4/4_1/4_1_modelo_swot.xlsx"
                            download
                            >
                            Download do Modelo
                        </a>

                    </div>

                </div>

            </Accordion>


            <Accordion title="REFERÊNCIA OFICIAL">
                <p>
                    Consulte a versão oficial da norma através do Instituto Português da Qualidade (IPQ).
                </p>
            </Accordion>


            <RequirementNavigation

                previousLink="/requirement4"
                previousLabel="Requisito 4"

                nextLink="/requirement4_2"
                nextLabel="4.2 Partes Interessadas"

            />   

        </>
    );
}

export default Requirement4_1;