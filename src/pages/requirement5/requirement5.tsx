import { Link } from "react-router-dom";
import Accordion from "../../components/accordion/accordion";

function Requirement5() {
    return (
        <>

            <h1>
                Requisito 5 - Liderança
            </h1>

            <Accordion title="O que é?">

                <p>
                    O requisito 5 estabelece o papel da liderança na implementação,
                    manutenção e melhoria do Sistema Integrado de Gestão.
                    A gestão de topo deve demonstrar compromisso, definir a política
                    do sistema e assegurar que responsabilidades e autoridades
                    estejam claramente atribuídas.
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

                                5.3 Papéis, Responsabilidades e Autoridades

                            </Link>

                        </li>

                    </ul>

                </div>

            </Accordion>

        </>
    );
}

export default Requirement5;