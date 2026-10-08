import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { OrganizationDiscoveryState } from '@integra/shared/requirements';
import { organizationDiscoveryApi, type DiscoveryAnswers } from '@/api/organization-discovery.api';
import { useAuth } from '@/contexts/auth-context-value';
import { Button } from '@/components/ui/button';
import { OrganizationDiscoveryIntro } from './organization-discovery-intro';
import { OrganizationDiscoveryStep } from './organization-discovery-step';
import { OrganizationDiscoveryReview } from './organization-discovery-review';
import { OrganizationDiscoveryComplete } from './organization-discovery-complete';

type Step = 1 | 2 | 3 | 4 | 5;
type Screen = 0 | Step | 6;

function answersFromState(state: OrganizationDiscoveryState): DiscoveryAnswers {
  return {
    1: { workforceRange: state.responses['4.1']?.workforceRange, workLocation: state.responses['4.1']?.workLocation, primaryLocation: state.responses['4.1']?.primaryLocation, yearsInOperation: state.responses['4.1']?.yearsInOperation },
    2: { activityTypes: state.responses['4.1']?.activityTypes, customerTypes: state.responses['4.1']?.customerTypes, operatingAreas: state.responses['4.1']?.operatingAreas, activityDescription: state.responses['4.1']?.activityDescription },
    3: state.responses['4.2'] ?? {},
    4: state.responses['4.4'] ?? {},
    5: state.responses['6.1'] ?? {},
  };
}

function saveErrorKey(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data?.error?.code === 'GUIDED_FLOW_REVISION_CONFLICT') return 'conflict';
  return 'saveError';
}

export default function OrganizationDiscovery() {
  const { t } = useTranslation('organizationDiscovery');
  const auth = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<OrganizationDiscoveryState | null>(null);
  const [answers, setAnswers] = useState<DiscoveryAnswers | null>(null);
  const [screen, setScreen] = useState<Screen>(0);
  const [editingReview, setEditingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const initialRequest = useRef<Promise<OrganizationDiscoveryState> | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setMessage(null);
    try {
      const saved = await organizationDiscoveryApi.get();
      setState(saved); setAnswers(answersFromState(saved));
      setScreen(saved.status === 'NOT_STARTED' ? 0 : saved.currentStep);
      setEditingReview(false);
    } catch { setMessage('loadError'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    initialRequest.current ??= organizationDiscoveryApi.get();
    initialRequest.current.then(saved => {
      if (!active) return;
      setState(saved); setAnswers(answersFromState(saved));
      setScreen(saved.status === 'NOT_STARTED' ? 0 : saved.currentStep);
    }).catch(() => { if (active) setMessage('loadError'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const save = useCallback(async (action: 'next' | 'back' | 'leave' | 'navigate', destination?: string) => {
    if (!state || !answers || screen < 1 || screen > 5 || busy) return;
    const step = screen as Step;
    setBusy(true); setMessage(null);
    try {
      // The generic API method accepts the step-specific answer shape; this switch
      // preserves that pairing at the call site.
      const saved = step === 1 ? await organizationDiscoveryApi.saveStep(1, state.revision, answers[1])
        : step === 2 ? await organizationDiscoveryApi.saveStep(2, state.revision, answers[2])
        : step === 3 ? await organizationDiscoveryApi.saveStep(3, state.revision, answers[3])
        : step === 4 ? await organizationDiscoveryApi.saveStep(4, state.revision, answers[4])
        : await organizationDiscoveryApi.saveStep(5, state.revision, answers[5]);
      setState(saved); setAnswers(answersFromState(saved)); setMessage('saved');
      if (action === 'leave') { void navigate('/dashboard'); return; }
      if (action === 'navigate' && destination) { void navigate(destination); return; }
      if (action === 'back') { setScreen(step === 1 ? 0 : (step - 1) as Screen); setEditingReview(false); return; }
      setScreen(editingReview ? 6 : (step + 1) as Screen);
      setEditingReview(false);
    } catch (error) { setMessage(saveErrorKey(error)); }
    finally { setBusy(false); }
  }, [state, answers, screen, busy, editingReview, navigate]);

  useEffect(() => {
    if (!state || !answers || state.status === 'COMPLETED' || screen < 1 || screen > 5) return;
    const onLinkClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      const anchor = target instanceof Element ? target.closest('a[href]') : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;
      const destination = new URL(anchor.href);
      if (destination.origin !== window.location.origin || (destination.pathname === window.location.pathname && destination.search === window.location.search)) return;
      event.preventDefault();
      event.stopPropagation();
      if (!busy) void save('navigate', `${destination.pathname}${destination.search}${destination.hash}`);
    };
    document.addEventListener('click', onLinkClick, true);
    return () => document.removeEventListener('click', onLinkClick, true);
  }, [state, answers, screen, busy, save]);

  async function complete() {
    if (!state || busy) return;
    setBusy(true); setMessage(null);
    try { setState(await organizationDiscoveryApi.complete(state.revision)); setMessage('saved'); }
    catch (error) { setMessage(saveErrorKey(error) === 'conflict' ? 'conflict' : 'completeError'); }
    finally { setBusy(false); }
  }

  if (auth.status !== 'authenticated') return null;
  if (loading) return <p role="status">{t('loading')}</p>;
  if (!state || !answers) return <div className="mx-auto max-w-3xl space-y-4" role="alert"><p>{t('loadError')}</p><Button onClick={() => void load()}>{t('retry')}</Button></div>;
  return <>
    {message && <div className="mx-auto mb-6 max-w-4xl rounded-lg border border-current/25 bg-card p-4 text-base" role={message === 'saved' ? 'status' : 'alert'}>{t(message)} {message === 'conflict' && <Button variant="outline" className="ml-3" onClick={() => void load()}>{t('reload')}</Button>}</div>}
    {state.status === 'COMPLETED' ? <OrganizationDiscoveryComplete />
      : screen === 0 ? <OrganizationDiscoveryIntro onStart={() => { setScreen(1); setMessage(null); }} />
      : screen === 6 ? <OrganizationDiscoveryReview state={state} profile={auth.profile} busy={busy} onEdit={step => { setScreen(step); setEditingReview(true); setMessage(null); }} onComplete={() => void complete()} />
      : <OrganizationDiscoveryStep step={screen} answers={answers} profile={auth.profile} onChange={setAnswers} onNext={() => void save('next')} onBack={() => void save('back')} onLeave={() => void save('leave')} busy={busy} />}
  </>;
}
