import Accordion from "../../components/accordion/accordion";
import RequirementNavigation from "../../components/requirementNavigation/requirementNavigation";

function Requirement7_4() {
  return (
    <>
        <h1>7.4 Comunicação</h1>

        <Accordion title="O que é?">
            <p>
                A organização deve determinar as comunicações internas e externas
                relevantes para o Sistema Integrado de Gestão.
            </p>

            <p>
                Para isso, deve definir o que comunicar, quando comunicar,
                a quem comunicar e como realizar essa comunicação.
            </p>
        </Accordion>

        <Accordion title="Por que é importante?">
            <p>
                Uma comunicação adequada garante que a informação relevante
                chega às pessoas certas e contribui para o funcionamento eficaz
                dos processos.
            </p>

            <p>
                Também permite melhorar a relação com clientes, fornecedores,
                autoridades, trabalhadores e outras partes interessadas.
            </p>
        </Accordion>

        <Accordion title="Como implementar?">
            <ul>
                <li>Identificar as necessidades de comunicação.</li>
                <li>Definir o que deve ser comunicado.</li>
                <li>Definir quem deve receber a informação.</li>
                <li>Definir quando a comunicação deve ocorrer.</li>
                <li>Definir os meios de comunicação adequados.</li>
                <li>Determinar quem é responsável por cada comunicação.</li>
                <li>Manter registos quando estes forem necessários.</li>
            </ul>
        </Accordion>

        <Accordion title="Explicação do Requisito">
            <p>
                A comunicação deve ser planeada de acordo com as necessidades
                da organização e dos seus sistemas de gestão.
            </p>

            <p>
                Algumas informações precisam de ser comunicadas internamente,
                como políticas, objetivos, procedimentos, alterações nos processos
                ou informações relacionadas com riscos.
            </p>

            <p>
                Outras informações podem necessitar de comunicação externa,
                por exemplo com clientes, fornecedores, autoridades, entidades
                reguladoras ou outras partes interessadas.
            </p>

            <p>
                O mais importante é garantir que a informação relevante é
                comunicada de forma adequada, no momento certo e às pessoas
                que precisam dela.
            </p>
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
                </a>.
            </p>
        </Accordion>

        <RequirementNavigation
            previousLink="/requirement7_3"
            previousLabel="7.3 Consciencialização"
            nextLink="/requirement7_5"
            nextLabel="7.5 Informação Documentada"
        />
    </>
  );
}

export default Requirement7_4;