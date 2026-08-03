import Accordion from "../../../components/accordion/accordion";
import RequirementNavigation from "../../../components/requirementNavigation/requirementNavigation";

function Sst() {

    const systems = JSON.parse(
        localStorage.getItem("selectedSystems") || "{}"
    );

    return (
        <>

            <h1>
                6.1 Planeamento - Segurança e Saúde no Trabalho
            </h1>

            <Accordion title="O que é?">

                <p>
                    A organização deve identificar os perigos existentes nas suas
                    atividades, avaliar os riscos para a Segurança e Saúde no
                    Trabalho e definir ações para eliminar perigos, reduzir
                    riscos e melhorar continuamente o desempenho do Sistema de
                    Gestão da Segurança e Saúde no Trabalho.
                </p>

            </Accordion>

            <Accordion title="Por que é importante?">

                <p>
                    Este requisito permite prevenir acidentes de trabalho,
                    doenças profissionais e outras situações que possam colocar
                    em risco os trabalhadores, garantindo ambientes de trabalho
                    mais seguros e saudáveis.
                </p>

            </Accordion>

            <Accordion title="Como implementar?">

                <ul>

                    <li>
                        Identificar os perigos existentes.
                    </li>

                    <li>
                        Avaliar os riscos para a Segurança e Saúde no Trabalho.
                    </li>

                    <li>
                        Identificar oportunidades de melhoria.
                    </li>

                    <li>
                        Identificar os requisitos legais aplicáveis.
                    </li>

                    <li>
                        Definir ações para eliminar ou controlar os riscos.
                    </li>

                    <li>
                        Acompanhar a eficácia das ações implementadas.
                    </li>

                </ul>

            </Accordion>

            <Accordion title="Explicação do Requisito">

                <p>
                    O planeamento do Sistema de Gestão da Segurança e Saúde no
                    Trabalho começa pela identificação dos perigos existentes na
                    organização. Estes perigos podem estar relacionados com
                    máquinas, equipamentos, instalações, produtos químicos,
                    atividades desenvolvidas ou qualquer outra situação capaz de
                    causar lesões ou afetar a saúde dos trabalhadores.
                </p>

                <p>
                    Depois de identificar os perigos, é necessário avaliar os
                    riscos associados, considerando a probabilidade de ocorrência
                    e a gravidade das consequências. Com base nessa avaliação,
                    são definidas medidas para eliminar os perigos sempre que
                    possível ou reduzir os riscos para níveis aceitáveis.
                </p>

                <p>
                    Além da avaliação dos riscos, a organização deve identificar
                    oportunidades de melhoria, cumprir os requisitos legais
                    aplicáveis e planear ações que contribuam para a melhoria
                    contínua do Sistema de Gestão da Segurança e Saúde no
                    Trabalho.
                </p>

            </Accordion>

            <Accordion title="Identificação de Perigos">

                <p>
                    Devem ser identificados todos os perigos existentes nas
                    atividades da organização, considerando as tarefas
                    realizadas, os equipamentos utilizados, os produtos
                    manuseados, as instalações, os trabalhadores, visitantes,
                    prestadores de serviços e outras pessoas que possam ser
                    afetadas.
                </p>

            </Accordion>

            <Accordion title="Avaliação dos Riscos SST">

                <p>
                    Após identificar os perigos, a organização deve avaliar os
                    riscos associados, determinando quais necessitam de medidas
                    de controlo prioritárias. Esta avaliação deve ser revista
                    sempre que ocorram alterações nas atividades, processos ou
                    condições de trabalho.
                </p>

            </Accordion>

            <Accordion title="Oportunidades para o SGSST">

                <p>
                    Para além dos riscos, a organização deve identificar
                    oportunidades que possam melhorar o desempenho do Sistema de
                    Gestão da Segurança e Saúde no Trabalho, como melhorias nos
                    processos, aquisição de equipamentos mais seguros, formação
                    dos trabalhadores ou alterações nas condições de trabalho.
                </p>

            </Accordion>

            <Accordion title="Requisitos Legais e Outros Requisitos">

                <p>
                    A organização deve identificar toda a legislação aplicável à
                    Segurança e Saúde no Trabalho e assegurar que os requisitos
                    legais e outros requisitos assumidos são cumpridos durante a
                    implementação e manutenção do sistema de gestão.
                </p>

            </Accordion>

            <Accordion title="Planeamento das Ações">

                <p>
                    Depois da avaliação dos riscos e da identificação das
                    oportunidades, devem ser planeadas ações para eliminar os
                    perigos, reduzir os riscos, cumprir a legislação aplicável e
                    melhorar continuamente o desempenho do Sistema de Gestão da
                    Segurança e Saúde no Trabalho.
                </p>

            </Accordion>

            <Accordion title="Ferramenta de Apoio - OiRA">

                <p>
                    A OiRA (Online Interactive Risk Assessment) é uma plataforma
                    gratuita desenvolvida para ajudar as organizações a
                    identificar perigos, avaliar riscos profissionais e elaborar
                    planos de ação para melhorar a Segurança e Saúde no Trabalho.
                </p>

                <p>
                    A ferramenta orienta o utilizador durante todo o processo de
                    avaliação de riscos, permitindo gerar automaticamente um
                    relatório e um plano de ação adaptado à realidade da
                    organização.
                </p>

                <p>
                    Por ser uma ferramenta reconhecida e amplamente utilizada,
                    o Integra SIG recomenda a sua utilização como apoio à
                    implementação deste requisito.
                </p>

                <div>

                    <a
                        href="https://oiraproject.eu/pt"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Aceder à Plataforma OiRA
                    </a>

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

                previousLink={
                    systems.sga
                        ? "/requirement6_1_environment"
                        : systems.sgq
                            ? "/requirement6_1_quality"
                            : "/requirement6"
                }

                previousLabel={
                    systems.sga
                        ? "6.1 Planeamento - Ambiente"
                        : systems.sgq
                            ? "6.1 Planeamento - Qualidade"
                            : "Requisito 6"
                }

                nextLink="/requirement6_2"

                nextLabel="6.2 Objetivos e Planeamento para os Alcançar"

            />

        </>
    );
}

export default Sst;