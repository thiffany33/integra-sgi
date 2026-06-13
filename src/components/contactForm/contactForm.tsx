function ContactForm() {
    return (
        <section>

            <h2>Entre em contato</h2>

            <form>

                <div>
                    <label>Nome</label>
                    <input type="text" />
                </div>

                <div>
                    <label>Email</label>
                    <input type="email" />
                </div>

                <div>
                    <label>Mensagem</label>
                    <textarea />
                </div>

                <button>
                    Enviar
                </button>

            </form>

        </section>
    );
}

export default ContactForm;