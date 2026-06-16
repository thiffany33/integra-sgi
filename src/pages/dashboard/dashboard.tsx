import { Link } from "react-router-dom";

function Dashboard() {
    return (
        <>

            <h1>Dashboard</h1>

            <p>
                Bem-vindo ao Integra SIG.
            </p>

            <h2>Sistemas Selecionados</h2>

            <ul>
                <li>SGQ - ISO 9001</li>
                <li>SGA - ISO 14001</li>
                <li>SGSST - ISO 45001</li>
                <li>SGSA - ISO 22000</li>
            </ul>

            <h2>Ações</h2>

            <Link to="/requirement">
                <button>
                    Requisitos
                </button>
            </Link>

            <Link to="/downloads">
                <button>
                    Downloads
                </button>
            </Link>

        </>
    );
}

export default Dashboard;