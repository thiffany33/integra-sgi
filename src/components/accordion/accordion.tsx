type AccordionProps = {
    title: string;
    children: React.ReactNode;
};

function Accordion({ title, children }: AccordionProps) {
    return (
        <details>

            <summary>
                {title}
            </summary>

            {children}

        </details>

        
    );
}

export default Accordion;