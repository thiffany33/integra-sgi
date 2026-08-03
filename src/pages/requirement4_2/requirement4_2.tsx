import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

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

            <Accordion title="Explicação do Requisito">

                <p>
                    O requisito 4.2 consiste em identificar quem são as partes interessadas da organização e compreender o que cada uma espera dela.
                    Conhecer estas necessidades e expectativas ajuda a organização a tomar melhores decisões, cumprir requisitos legais e contratuais, reduzir riscos e melhorar o seu desempenho.
                    Sempre que existirem alterações relevantes nas partes interessadas ou nas suas necessidades, esta análise deve ser revista para garantir que o Sistema de Gestão continua adequado à realidade da organização.
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

                </div>

            </Accordion>

            <RequirementNavigation

                previousLink="/requirement4_1"
                previousLabel="Requisito 4.1"

                nextLink="/requirement4_3"
                nextLabel="4.3 Âmbito"

            /> 

        </>
    );
}

export default Requirement4_2;