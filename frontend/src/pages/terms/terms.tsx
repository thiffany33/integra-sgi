import { TERMS_VERSION } from '@integra/shared/auth';
import { PolicyDocument } from '@/components/policy-document/policy-document';
import { PRIVACY_CONTACT } from '@/lib/legal';

// A draft by the owner; changing the text means bumping TERMS_VERSION, so every account accepts it again.
export default function Terms() {
  return <PolicyDocument namespace="terms" lastUpdated={TERMS_VERSION} values={PRIVACY_CONTACT} />;
}
