import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeading } from "@/components/pageHeading/pageHeading";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return <div className="mx-auto max-w-2xl py-10"><PageHeading eyebrow="Página não encontrada" title="Vamos encontrar o caminho de volta." description="Este endereço não está disponível. Você pode voltar ao início ou consultar o guia de gestão." /><div className="flex flex-wrap gap-4"><Button asChild><Link to="/"><ArrowLeft aria-hidden="true" />Voltar ao início</Link></Button><Button asChild variant="outline"><Link to="/requirement">Abrir guia de gestão</Link></Button></div></div>;
}
