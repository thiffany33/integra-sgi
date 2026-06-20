import Accordion from "../../components/accordion/accordion";

function Requirement4_1() {
    return (
        <>

            <h1>
                4.1 Compreender a organização e o seu contexto
            </h1>

                <Accordion title="O que é?">
                    <p>
                        A organização deve compreender os fatores internos
                        e externos que influenciam o sistema de gestão.
                    </p>
                </Accordion>

                <Accordion title="Por que é importante">
                    <p>
                        Permite identificar riscos, oportunidades
                        e fatores que podem impactar os objetivos.
                    </p>
                </Accordion>

                <Accordion title="Como Implementar?">
                    <ul>

                        <li>Identificar fatores internos.</li>

                        <li>Identificar fatores externos.</li>

                        <li>Avaliar riscos e oportunidades.</li>

                    </ul>
                </Accordion>

                <Accordion title="Vídeo Explicativo">

                    <div>

                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Assistir vídeo explicativo
                        </a>

                    </div>

                </Accordion>

                <Accordion title="Ferramentas de Apoio">

                    <div>

                        <h3>
                            Modelo SWOT
                        </h3>

                        <div>

                            <a
                                href="/documents/requirement4/4_1/4_1_modelo_swot.docx"
                                download
                            >
                                Download do Modelo
                            </a>

                        </div>

                        <div>

                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Vídeo Explicativo do Modelo
                            </a>

                        </div>

                    </div>

                </Accordion>


                <Accordion title="REFERÊNCIA OFICIAL">
                    <p>
                        Consulte a versão oficial da norma através do Instituto Português da Qualidade (IPQ).
                    </p>
                </Accordion>

        </>
    );
}

export default Requirement4_1;