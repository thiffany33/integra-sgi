import { Link } from "react-router-dom";

function Register() {
    return (
        <>

            <h1>Registe sua Organização</h1>

            <form>

                <div>
                    <label>Nome da Organização</label>
                    <input type="text" />
                </div>

                <div>
                    <label>NIF</label>
                    <input type="text" />
                </div>

                <div>
                    <label>Ramo de Atividade</label>

                    <select>

                        <option>
                            Selecione
                        </option>

                        <option>
                            Alimentar
                        </option>

                        <option>
                            Construção
                        </option>

                        <option>
                            Serviços
                        </option>

                        <option>
                            Agronegócio
                        </option>

                        <option>
                            Comércio
                        </option>

                        <option>
                            Indústria
                        </option>

                        <option>
                            Tecnologia
                        </option>

                    </select>

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