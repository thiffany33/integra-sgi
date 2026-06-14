function Representative() {
    return (
        <>

            <h1>Representante da Empresa</h1>

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

                <button>
                    Próximo
                </button>

            </form>

        </>
    );
}

export default Representative;