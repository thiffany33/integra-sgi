import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";


function Requirement5_1() {
    return (
        <>

            <h1>
                5.1 Liderança e Compromisso
            </h1>

            <Accordion title="O que é?">

                <p>
                    A gestão de topo deve demonstrar liderança e compromisso com o
                    Sistema Integrado de Gestão, assegurando que os objetivos,
                    recursos e responsabilidades necessários para o seu
                    funcionamento são definidos e mantidos.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    O envolvimento da liderança é essencial para o sucesso do
                    sistema de gestão. Quando a gestão de topo participa
                    ativamente, demonstra compromisso e incentiva a melhoria
                    contínua, toda a organização beneficia.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Participar ativamente na implementação do sistema.
                    </li>

                    <li>
                        Disponibilizar os recursos necessários.
                    </li>

                    <li>
                        Promover a melhoria contínua.
                    </li>

                    <li>
                        Comunicar a importância do sistema de gestão aos colaboradores.
                    </li>

                    <li>
                        Integrar o sistema de gestão nas atividades da organização.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="Como o auditor avalia este requisito?">

                <p>
                    Este requisito é normalmente avaliado através de entrevistas,
                    observação da participação da gestão de topo e análise das
                    decisões tomadas durante a implementação do Sistema Integrado
                    de Gestão.
                </p>

                <p>
                    O auditor procura evidências de que a liderança está
                    efetivamente comprometida com o sistema, e não apenas que
                    aprovou documentos.
                </p>

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

                previousLink="/requirement5"
                previousLabel="Requisito 5"

                nextLink="/requirement5_2"
                nextLabel="5.2 Política Integrada"

            /> 

        </>
    );
}

export default Requirement5_1;