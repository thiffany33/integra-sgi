import { Link } from "react-router-dom";

function Representative() {
    return (
        <>

            <h1>Representante da Organização</h1>

            <form>

                <div>
                    <label>Nome</label>
                    <input type="text" />
                </div>

                <div>
                    <label>Email Secundário</label>
                    <input type="email" />
                </div>

                <div>
                    <label>Telefone</label>
                    <input type="text" />
                </div>

            </form>

            <Link to="/select-systems">
                <button>
                    Próximo
                </button>
            </Link>

        </>
    );
}

export default Representative;