import { useState } from "react";
import { Link } from "react-router-dom";

function SelectSystems() {

    const [systems, setSystems] = useState({
        sgq: true,
        sga: true,
        sgsst: true
    });

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {

        const { name, checked } = event.target;

        setSystems(previous => ({
            ...previous,
            [name]: checked
        }));

    }

    function saveSystems() {

        localStorage.setItem(
            "selectedSystems",
            JSON.stringify(systems)
        );

    }

    return (

        <>

            <h1>
                Selecione os Sistemas Integrados
            </h1>

            <p>
                Escolha os sistemas que deseja implementar na sua organização.
            </p>

            <form>

                <div>

                    <input
                        type="checkbox"
                        name="sgq"
                        checked={systems.sgq}
                        onChange={handleChange}
                    />

                    <label>
                        SGQ - Sistema de Gestão da Qualidade (ISO 9001)
                    </label>

                </div>

                <div>

                    <input
                        type="checkbox"
                        name="sga"
                        checked={systems.sga}
                        onChange={handleChange}
                    />

                    <label>
                        SGA - Sistema de Gestão Ambiental (ISO 14001)
                    </label>

                </div>

                <div>

                    <input
                        type="checkbox"
                        name="sgsst"
                        checked={systems.sgsst}
                        onChange={handleChange}
                    />

                    <label>
                        SGSST - Sistema de Gestão da Segurança e Saúde no Trabalho (ISO 45001)
                    </label>

                </div>

            </form>

            <Link
                to="/dashboard"
                onClick={saveSystems}
            >

                <button>

                    Criar meu Sistema de Gestão Integrado

                </button>

            </Link>

        </>

    );

}

export default SelectSystems;