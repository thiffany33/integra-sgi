import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement6() {

    const systems = JSON.parse(
        localStorage.getItem("selectedSystems") || "{}"
    );

    return (

        <>

            <h1>
                Requisito 6 - Planeamento
            </h1>

            <Accordion title="O que é?">

                <p>
                    O requisito 6 estabelece como a organização deve planear o
                    Sistema Integrado de Gestão, identificando riscos,
                    oportunidades, objetivos e ações necessárias para alcançar os
                    resultados pretendidos e promover a melhoria contínua.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    O planeamento é a base para garantir que o Sistema Integrado
                    de Gestão seja implementado de forma eficaz, prevenindo
                    problemas antes que ocorram e promovendo a melhoria contínua.
                </p>

            </Accordion>

            <Accordion title="Como funciona no Integra SIG?">

                <p>
                    Embora o requisito 6 seja comum às normas ISO, o requisito
                    6.1 possui requisitos específicos para cada sistema de gestão.
                </p>

                <p>
                    Por esse motivo, o Integra SIG apresentará automaticamente
                    apenas os conteúdos correspondentes aos sistemas de gestão
                    selecionados durante a configuração da organização.
                </p>

                <p>

                    A sequência será apresentada automaticamente conforme os
                    sistemas escolhidos.

                </p>

            </Accordion>

            <Accordion title="Estrutura da Norma">

                <p>
                    Um dos erros mais comuns é tentar utilizar a mesma metodologia
                    de avaliação de riscos para todos os sistemas de gestão.
                    Cada norma possui requisitos específicos que devem ser
                    considerados durante o planeamento.
                </p>

            </Accordion>

            <Accordion title="Vídeo Explicativo">

                <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noreferrer"
                >
                    Assistir vídeo introdutório
                </a>

            </Accordion>

            <Accordion title="Referência Oficial">

                <p>
                    Consulte a versão oficial da norma através do Instituto Português da Qualidade (IPQ).
                </p>

            </Accordion>

            <RequirementNavigation

                previousLink="/requirement5"
                previousLabel="Requisito 5 - Liderança"

                nextLink={
                    systems.sgq
                        ? "/requirement6_1_quality"
                        : systems.sga
                            ? "/requirement6_1_environment"
                            : "/requirement6_1_sst"
                }

                nextLabel={
                    systems.sgq
                        ? "6.1 Planeamento - Qualidade"
                        : systems.sga
                            ? "6.1 Planeamento - Ambiente"
                            : "6.1 Planeamento - Segurança e Saúde no Trabalho"
                }

            />

        </>

    );

}

export default Requirement6;