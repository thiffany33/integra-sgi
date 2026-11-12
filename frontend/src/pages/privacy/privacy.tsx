import { PolicyDocument } from '@/components/policy-document/policy-document';
import { PRIVACY_CONTACT } from '@/lib/legal';

// Mirrors the owner's privacy, retention and security policies (docs/).
const LAST_UPDATED = '2026-11-11';

export default function Privacy() {
  return <PolicyDocument namespace="privacy" lastUpdated={LAST_UPDATED} values={PRIVACY_CONTACT} />;
}
