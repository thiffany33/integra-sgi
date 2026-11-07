import type { ComponentProps } from "react";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// Templates redirect to a signed storage URL on another origin, where browsers ignore `download`
// and show PDFs in place. A new tab keeps the guide open while the file opens or downloads.
export function DownloadLink({ children, ...props }: ComponentProps<"a">) {
  const { t } = useTranslation("common");
  return <Button asChild variant="outline" className="max-w-full justify-start py-3 text-left"><a {...props} download target="_blank" rel="noopener noreferrer"><Download aria-hidden="true" className="size-5" /><span>{children}<span className="sr-only"> {t("opensInNewTab")}</span></span></a></Button>;
}
