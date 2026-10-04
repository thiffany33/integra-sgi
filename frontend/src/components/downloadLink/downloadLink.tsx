import type { ComponentProps } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadLink({ children, ...props }: ComponentProps<"a">) {
  return <Button asChild variant="outline" className="max-w-full justify-start py-3 text-left"><a {...props} download><Download aria-hidden="true" className="size-5" /><span>{children}</span></a></Button>;
}
