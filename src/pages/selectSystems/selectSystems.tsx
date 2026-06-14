import { Link } from "react-router-dom";

function SelectSystems() {
    return (
        <>

            <h1>Selecione os Sistemas Integrados</h1>

            <p>
                Escolha os sistemas que deseja implementar
                na sua organização.
            </p>

            <form>

                <div>
                    <input type="checkbox" />
                    <label>SGQ - Sistema de Gestão da Qualidade (ISO 9001)</label>
                </div>

                <div>
                    <input type="checkbox" />
                    <label>SGA - Sistema de Gestão Ambiental (ISO 14001)</label>
                </div>

                <div>
                    <input type="checkbox" />
                    <label>SGSST - Sistema de Gestão de Segurança e Saúde no Trabalho (ISO 45001)</label>
                </div>

                <div>
                    <input type="checkbox" />
                    <label>SGSA - Sistema de Gestão da Segurança Alimentar (ISO 22000)</label>
                </div>

            </form>

            <Link to="/dashboard">
                <button>
                    Criar meu SGI
                </button>
            </Link>

        </>
    );
}

export default SelectSystems;