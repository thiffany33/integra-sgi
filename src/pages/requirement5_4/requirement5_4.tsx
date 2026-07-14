import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement5_4() {

    return (

        <>

            <h1>
                5.4 Consulta e Participação dos Trabalhadores
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve assegurar que os trabalhadores são
                    consultados e participam ativamente nas decisões relacionadas
                    com a Segurança e Saúde no Trabalho.
                </p>

                <p>
                    Este requisito é exclusivo da ISO 45001 e tem como objetivo
                    envolver os trabalhadores na melhoria contínua das condições
                    de trabalho e na prevenção de acidentes e doenças profissionais.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    Os trabalhadores conhecem melhor do que ninguém os riscos das
                    atividades que executam diariamente. A sua participação permite
                    identificar perigos, melhorar processos e fortalecer a cultura
                    de segurança da organização.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Incentivar a participação dos trabalhadores.
                    </li>

                    <li>
                        Consultar os colaboradores antes de alterações importantes.
                    </li>

                    <li>
                        Permitir que comuniquem perigos e sugestões.
                    </li>

                    <li>
                        Envolver os trabalhadores nas avaliações de risco.
                    </li>

                    <li>
                        Garantir que não existem represálias pela participação.
                    </li>

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

            <Accordion title="Referência Oficial">

                <p>
                    Consulte a versão oficial da norma através do Instituto Português da Qualidade (IPQ).
                </p>

            </Accordion>

                <RequirementNavigation

                previousLink="/requirement5_3"
                previousLabel="Requisito 5.3"

                nextLink="/requirement6"
                nextLabel="6 - Planeamento"
            /> 

        </>

    );

}

export default Requirement5_4;