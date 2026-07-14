import { Link } from "react-router-dom";
import Accordion from "../../components/accordion/accordion";

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

            <Accordion title="Vídeo Explicativo">

                <div>

                    <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Assistir vídeo introdutório
                    </a>

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

        </>
    );
}

export default Requirement5;