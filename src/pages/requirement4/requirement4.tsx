import Accordion from "../../components/accordion/accordion";

function Requirement4() {
    return (
        <>

            <h1>
                Requisito 4 - Contexto da Organização
            </h1>

            <Accordion title="O que é?">

                <p>
                    o Requisito 4 serve para garantir que o sistema de gestão foi construído com os pés no chão
                    conhecendo bem a empresa, quem a rodeia e como os processos se ligam entre si.
                </p>

            </Accordion>

            <Accordion title="Vídeo Explicativo">

                <div>

                    <a
                        href="https://youtube.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Assistir vídeo introdutório
                    </a>

                </div>

            </Accordion>

            <Accordion title="Sub-requisitos">

                <div>

                    <ul>

                        <li>
                            <a href="/requirement4_1">
                                4.1 Compreender a organização e o seu contexto
                            </a>
                        </li>

                        <li>
                            <a href="/requirement4_2">
                                4.2 Compreender as necessidades e expectativas das partes interessadas
                            </a>
                        </li>

                        <li>
                            <a href="/requirement4_3">
                                4.3 Determinar o âmbito do sistema de gestão
                            </a>
                        </li>

                        <li>
                            <a href="/requirement4_4">
                                4.4 Sistema de gestão e seus processos
                            </a>
                        </li>

                    </ul>

                </div>

            </Accordion>

        </>
    );
}

export default Requirement4;