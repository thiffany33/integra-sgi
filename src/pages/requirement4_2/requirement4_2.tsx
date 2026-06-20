import Accordion from "../../components/accordion/accordion";

function Requirement4_2() {
    return (
        <>

            <h1>
                4.2 Compreender as necessidades e expectativas das partes interessadas
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve identificar as partes interessadas relevantes
                    para o Sistema Integrado de Gestão e compreender as suas
                    necessidades e expectativas.
                </p>

                <p>
                    As partes interessadas podem influenciar ou ser influenciadas
                    pelas atividades da organização.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    Compreender as necessidades das partes interessadas ajuda a
                    organização a identificar requisitos relevantes, reduzir riscos
                    e aumentar a satisfação dos diferentes grupos envolvidos.
                </p>

            </Accordion>

            <Accordion title="Vídeo Explicativo">

                <p>
                    LINK DO VÍDEO DO YOUTUBE
                </p>

            </Accordion>

           <Accordion title="Ferramentas de Apoio">
                <div>

                    <h3>
                        Matriz de Partes Interessadas
                    </h3>

                    <div>

                        <a
                            href={"/documents/requirement4/4_2/4_2_modelo_partes_interessadas.xlsx"}
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
                            Vídeo Explicativo
                        </a>

                    </div>

                </div>

            </Accordion>

        </>
    );
}

export default Requirement4_2;