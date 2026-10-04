import type { ReactNode } from "react";

export function PageHeading({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <div className="mb-9 max-w-3xl space-y-4">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h1>{title}</h1>
    {description && <p className="max-w-2xl text-lg text-muted-foreground">{description}</p>}
    {children}
  </div>;
}
