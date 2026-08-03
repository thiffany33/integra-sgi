import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement5_2() {
    return (
        <>

            <h1>
                5.2 Política Integrada
            </h1>

            <Accordion title="O que é?">

                <p>
                    A Política Integrada é o documento que demonstra o compromisso
                    da gestão de topo com o Sistema Integrado de Gestão. Ela deve
                    estar alinhada com o contexto da organização, apoiar a direção
                    estratégica da empresa e servir de base para a definição dos
                    objetivos do sistema de gestão.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    A Política Integrada estabelece os princípios e compromissos da
                    organização relativamente à qualidade, ambiente, segurança e
                    saúde no trabalho, segurança alimentar e outros sistemas
                    implementados, demonstrando o compromisso da gestão com a
                    melhoria contínua.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Definir os compromissos da organização.
                    </li>

                    <li>
                        Garantir que a política está alinhada com os objetivos estratégicos.
                    </li>

                    <li>
                        Comunicar a política a todos os colaboradores.
                    </li>

                    <li>
                        Disponibilizar a política às partes interessadas quando aplicável.
                    </li>

                    <li>
                        Rever periodicamente a política para garantir a sua adequação.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="💡 Dica do Auditor">

                <p>
                    Um dos erros mais frequentes é elaborar uma Política Integrada
                    genérica, copiada de outras organizações. Durante a auditoria,
                    espera-se que a política reflita a realidade da empresa, o seu
                    contexto, os sistemas implementados e a sua direção estratégica.
                </p>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <div>

                    <p>
                        O requisito 5.2 consiste em estabelecer a Política do Sistema de Gestão Integrado, que representa o compromisso da organização com a qualidade, a proteção do ambiente, a segurança e saúde no trabalho e a melhoria contínua.
                        Nesta etapa, a gestão de topo define os princípios e compromissos que orientam o sistema de gestão, assegurando que a política seja adequada ao contexto da organização, comunicada, compreendida e disponibilizada às partes interessadas.
                        A principal evidência deste requisito é a Política do Sistema de Gestão Integrado, aprovada pela gestão de topo e divulgada de forma a garantir o seu conhecimento e aplicação em toda a organização.
                    </p>

                </div>

            </Accordion>

            <Accordion title="Ferramentas de Apoio">

                <div>

                    <h3>
                        Modelo de Política Integrada
                    </h3>

                    <div>

                        <a
                            href="/documents/requirement5/5_2/5_2_modelo_politica.docx"
                            download
                        >
                            Download do Modelo
                        </a>

                    </div>

                </div>

            </Accordion>

            <Accordion title="Referência Oficial">

                <p>
                    Consulte a versão oficial da norma através do{" "}

                    <a
                        href="https://www.ipq.pt"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Instituto Português da Qualidade (IPQ)
                    </a>
                    .

                </p>

            </Accordion>

            <RequirementNavigation

                previousLink="/requirement5_1"
                previousLabel="Requisito 5.1"

                nextLink="/requirement5_2"
                nextLabel="5.3 - Funções e Responsabilidades"

            /> 

        </>
    );
}

export default Requirement5_2;