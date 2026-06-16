import { Link } from "react-router-dom";

function Requirement() {
    return (
        <>

            <h1>
                Requisito 4 - Contexto da Organização
            </h1>

            <p>
                Este requisito tem como objetivo compreender
                a organização, o seu contexto, as partes
                interessadas e os processos necessários para
                o funcionamento do Sistema Integrado de Gestão.
            </p>

            <h2>Sub-requisitos</h2>

            <ul>

                <li>
                    <Link to="/requirement41">
                        4.1 Compreender a organização e o seu contexto
                    </Link>
                </li>

                <li>
                    <Link to="/requirement42">
                        4.2 Partes interessadas
                    </Link>
                </li>

                <li>
                    <Link to="/requirement43">
                        4.3 Âmbito do sistema de gestão
                    </Link>
                </li>

                <li>
                    <Link to="/requirement44">
                        4.4 Sistema de gestão e processos
                    </Link>
                </li>

            </ul>

        </>
    );
}

export default Requirement;