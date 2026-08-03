import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";


function Requirement4() {
    return (
        <>

            <h1>
                Requisito 4 - Contexto da Organização
            </h1>

            <Accordion title="O que é?">

                <p>
                    o Requisito 4 serve para garantir que o sistema de gestão foi construído com os pés no chão
                    conhecendo bem a empresa, quem a rodeia e como os processos se ligam entre si.
                </p>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <div>

                    <p>
                        O Requisito 4 é o ponto de partida do Sistema de Gestão. Antes de definir objetivos, procedimentos ou controlos, a organização precisa de conhecer a sua realidade: 
                    </p>

                    <p>
                        compreender o contexto em que atua, identificar quem são as partes interessadas e quais são as suas necessidades,
                        definir o âmbito do Sistema de Gestão e mapear os processos da organização. 
                    </p>
                    <p>
                        Esta informação permite tomar decisões mais adequadas, identificar riscos e oportunidades e garantir que o sistema responde às necessidades da organização e dos seus stakeholders.
                    </p>

                </div>

            </Accordion>

            <Accordion title="Sub-requisitos">

                <div>

                    <ul>

                        <li>
                            <a href="/requirement4_1">
                                4.1 Compreender a organização e o seu contexto
                            </a>
                        </li>

                        <li>
                            <a href="/requirement4_2">
                                4.2 Compreender as necessidades e expectativas das partes interessadas
                            </a>
                        </li>

                        <li>
                            <a href="/requirement4_3">
                                4.3 Determinar o âmbito do sistema de gestão
                            </a>
                        </li>

                        <li>
                            <a href="/requirement4_4">
                                4.4 Sistema de gestão e seus processos
                            </a>
                        </li>

                    </ul>

                </div>

            </Accordion>


            <RequirementNavigation

                nextLink="/requirement4_1"
                nextLabel="4.1 Contexto da Organização"

            />


        </>
    );
}

export default Requirement4;