import { useState, type ReactNode } from "react";
import { defaultSystems } from "@/lib/systems";
import { OnboardingContext, type Organization, type Representative } from "./onboarding-state";
import { useAuth } from "./auth-context-value";
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [organization, setOrganization] = useState<Organization>({ name: "", nif: "", sector: "", email: "" });
  const [representative, setRepresentative] = useState<Representative>({ name: "", email: "", phone: "" });
  const [systems, setSystems] = useState(defaultSystems);
  const currentOrganization = auth.status === "authenticated" ? auth.profile.organization : organization;
  const currentRepresentative = auth.status === "authenticated" ? auth.profile.representative : representative;
  const currentSystems = auth.status === "authenticated" ? {
    sgq: auth.profile.selectedSystems.includes("sgq"),
    sga: auth.profile.selectedSystems.includes("sga"),
    sgsst: auth.profile.selectedSystems.includes("sgsst"),
  } : systems;
  return <OnboardingContext value={{ organization: currentOrganization, representative: currentRepresentative, systems: currentSystems,
    updateOrganization: changes => setOrganization(value => ({ ...value, ...changes })),
    updateRepresentative: changes => setRepresentative(value => ({ ...value, ...changes })),
    updateSystems: setSystems,
  }}>{children}</OnboardingContext>;
}
