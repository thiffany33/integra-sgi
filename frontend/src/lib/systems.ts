export type Systems = { sgq: boolean; sga: boolean; sgsst: boolean };
export const systemOptions = [
  { key: "sgq", title: "Gestão da Qualidade", code: "SGQ · ISO 9001", description: "Organize processos e melhore a qualidade dos seus produtos e serviços." },
  { key: "sga", title: "Gestão Ambiental", code: "SGA · ISO 14001", description: "Identifique impactos ambientais e use os recursos de forma responsável." },
  { key: "sgsst", title: "Segurança e Saúde no Trabalho", code: "SGSST · ISO 45001", description: "Identifique riscos e cuide da segurança das pessoas no trabalho." },
] as const;
export const defaultSystems: Systems = { sgq: true, sga: true, sgsst: true };
