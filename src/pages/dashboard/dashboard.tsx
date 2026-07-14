import { Link } from "react-router-dom";

import getSelectedSystems from "../../utils/selectedSystems";

function Dashboard() {

    const systems = getSelectedSystems();

    return (
        <>

            <h1>
                Dashboard
            </h1>

            <p>
                Bem-vindo ao Integra SIG.
            </p>

            <h2>
                Sistemas Selecionados
            </h2>

            <ul>

                {systems.sgq && (

                    <li>
                        SGQ - ISO 9001
                    </li>

                )}

                {systems.sga && (

                    <li>
                        SGA - ISO 14001
                    </li>

                )}

                {systems.sgsst && (

                    <li>
                        SGSST - ISO 45001
                    </li>

                )}

            </ul>

            <h2>
                Ações
            </h2>

            <Link to="/requirement">

                <button>

                    Entrar no SIG

                </button>

            </Link>

        </>

    );
}

export default Dashboard;