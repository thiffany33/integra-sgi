import AppRoutes from "./routes/appRoutes";
import { OnboardingProvider } from "./contexts/onboarding-provider";
import { AuthProvider } from "./contexts/auth-context";
import { I18nDocumentLanguage } from "./components/i18n-document-language";
export default function App() {
  return <AuthProvider><OnboardingProvider><I18nDocumentLanguage><AppRoutes /></I18nDocumentLanguage></OnboardingProvider></AuthProvider>;
}
