import { Link } from "react-router-dom";

function Register() {
    return (
        <>

            <h1>Cadastro da Empresa</h1>

            <form>

                <div>
                    <label>Nome da Empresa</label>
                    <input type="text" />
                </div>

                <div>
                    <label>NIF</label>
                    <input type="text" />
                </div>

                <div>
                    <label>Ramo de Atividade</label>
                    <input type="text" />
                </div>

                <div>
                    <label>Email Principal</label>
                    <input type="email" />
                </div>

            </form>

            <Link to="/representative">
                <button>
                    Próximo
                </button>
            </Link>

        </>
    );
}

export default Register;