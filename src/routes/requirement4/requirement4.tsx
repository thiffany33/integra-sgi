import { Link } from "react-router-dom";

function Requirement4() {
    return (
        <>

            <h1>
                Requisito 4 - Contexto da Organização
            </h1>

            <p>
                 o Requisito 4 serve para garantir que o sistema de gestão foi construído com os pés no chão
                 conhecendo bem a empresa, quem a rodeia e como os processos se ligam entre si.
            </p>

            <h2>
                Sub-requisitos
            </h2>

            <ul>

                <li>
                    <Link to="/requirement4_1">
                        4.1 Compreender a organização e o seu contexto
                    </Link>
                </li>

                <li>
                    <Link to="/requirement4_2">
                        4.2 Necessidades e expectativas das partes interessadas
                    </Link>
                </li>

                <li>
                    <Link to="/requirement4_3">
                        4.3 Determinar o âmbito do sistema de gestão
                    </Link>
                </li>

                <li>
                    <Link to="/requirement4_4">
                        4.4 Sistema de gestão e seus processos
                    </Link>
                </li>

            </ul>

        </>
    );
}

export default Requirement4;