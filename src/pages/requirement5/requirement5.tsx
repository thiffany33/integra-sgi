import { Link } from "react-router-dom";
import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement5() {

    const systems = JSON.parse(
        localStorage.getItem("selectedSystems") || "{}"
    );

    return (
        <>

            <h1>
                Requisito 5 - Liderança
            </h1>

            <Accordion title="O que é?">

                <p>
                    O requisito 5 estabelece o papel da gestão de topo na
                    implementação, manutenção e melhoria do Sistema Integrado
                    de Gestão. A liderança deve demonstrar compromisso,
                    disponibilizar recursos e assegurar que as responsabilidades
                    são claramente definidas.
                </p>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <div>

                    <p>
                        O requisito 5 consiste em assegurar o compromisso da liderança com o Sistema de Gestão Integrado e promover a participação das pessoas na sua implementação e melhoria.
                        Nesta etapa, a organização estabelece a sua política, define papéis, responsabilidades e autoridades, disponibiliza os recursos necessários e incentiva a consulta e o envolvimento dos trabalhadores nos processos de gestão.
                        Uma liderança ativa e uma participação eficaz contribuem para o cumprimento dos objetivos da qualidade, da proteção do ambiente e da segurança e saúde no trabalho, fortalecendo a cultura organizacional e promovendo a melhoria contínua do sistema.
                    </p>

                </div>

            </Accordion>

            <Accordion title="Sub-requisitos">

                <div>

                    <ul>

                        <li>

                            <Link to="/requirement5_1">

                                5.1 Liderança e Compromisso

                            </Link>

                        </li>

                        <li>

                            <Link to="/requirement5_2">

                                5.2 Política Integrada

                            </Link>

                        </li>

                        <li>

                            <Link to="/requirement5_3">

                                5.3 Funções, Responsabilidades e Autoridades Organizacionais

                            </Link>

                        </li>

                        {systems.sgsst && (

                            <li>

                                <Link to="/requirement5_4">

                                    5.4 Consulta e Participação dos Trabalhadores

                                </Link>

                            </li>

                        )}

                    </ul>

                </div>

            </Accordion>

            <RequirementNavigation

                previousLink="/requirement4_4"
                previousLabel="Requisito 4.4"

                nextLink="/requirement5_1"
                nextLabel="4.1 Liderança e Compromisso"

            /> 

        </>
    );
}

export default Requirement5;