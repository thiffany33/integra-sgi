import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement5_3() {

    const systems = JSON.parse(
        localStorage.getItem("selectedSystems") || "{}"
    );

    return (
        <>

            <h1>
                5.3 Funções, Responsabilidades e Autoridades Organizacionais
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve definir e comunicar claramente as funções,
                    responsabilidades e autoridades necessárias para garantir o
                    funcionamento eficaz do Sistema Integrado de Gestão.
                </p>

                <p>
                    Cada colaborador deve compreender o seu papel, as suas
                    responsabilidades e os limites da sua autoridade dentro da
                    organização.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    A definição clara das responsabilidades evita conflitos,
                    reduz falhas na comunicação, facilita a tomada de decisão e
                    contribui para o cumprimento dos requisitos do Sistema
                    Integrado de Gestão.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Definir as funções existentes na organização.
                    </li>

                    <li>
                        Identificar as responsabilidades de cada função.
                    </li>

                    <li>
                        Definir as autoridades necessárias para cada cargo.
                    </li>

                    <li>
                        Comunicar estas informações a todos os colaboradores.
                    </li>

                    <li>
                        Rever sempre que ocorrerem alterações na estrutura organizacional.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <div>

                    <p>
                        O requisito 5.3 consiste em definir os papéis, responsabilidades e autoridades dentro do Sistema de Gestão Integrado.
                        Nesta etapa, a organização estabelece quem é responsável por cada atividade, quais as suas funções e o nível de autoridade para tomar decisões
                        e assegurar o cumprimento dos requisitos do sistema. A definição clara das responsabilidades contribui para uma melhor organização das atividades,
                        facilita a comunicação entre os colaboradores e promove a eficácia e a melhoria contínua do Sistema de Gestão Integrado.
                    </p>

                </div>

            </Accordion>

            <Accordion title="Ferramentas de Apoio">

                <div>

                    <h3>
                        Matriz de Responsabilidades
                    </h3>

                    <div>

                        <a
                            href="/documents/requirement5/5_3/5_3_modelo_matriz_responsabilidades.xlsx"
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

                previousLink="/requirement5_2"
                previousLabel="5.2 Política Integrada"

                nextLink={
                    systems.sgsst
                        ? "/requirement5_4"
                        : "/requirement6"
                }

                nextLabel={
                    systems.sgsst
                        ? "5.4 Consulta e Participação dos Trabalhadores"
                        : "Requisito 6 - Planeamento"
                }

            />

        </>
    );
}

export default Requirement5_3;