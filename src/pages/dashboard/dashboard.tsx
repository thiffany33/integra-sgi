import { Link } from "react-router-dom";

function Dashboard() {

    const systems = JSON.parse(
        localStorage.getItem("selectedSystems") || "{}"
    );

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
                        SGQ - Sistema de Gestão da Qualidade (ISO 9001)
                    </li>

                )}

                {systems.sga && (

                    <li>
                        SGA - Sistema de Gestão Ambiental (ISO 14001)
                    </li>

                )}

                {systems.sgsst && (

                    <li>
                        SGSST - Sistema de Gestão da Segurança e Saúde no Trabalho (ISO 45001)
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