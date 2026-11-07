import { createContext, useContext } from "react";
import type { Systems } from "@/lib/systems";
export type Organization = { name: string; nif: string; sector: string; email: string };
export type Representative = { name: string; email: string; phone: string };
export type OnboardingState = {
  organization: Organization;
  representative: Representative;
  systems: Systems;
  updateOrganization: (changes: Partial<Organization>) => void;
  updateRepresentative: (changes: Partial<Representative>) => void;
  updateSystems: (systems: Systems) => void;
};
export const OnboardingContext = createContext<OnboardingState | null>(null);
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error("OnboardingProvider is required");
  return context;
}
