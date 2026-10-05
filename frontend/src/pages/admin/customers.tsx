import axios from 'axios';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { SelectedSystem } from '@integra/shared/profile';
import { adminApi, type AdminCustomer } from '../../api/admin.api';
import { PageHeading } from '../../components/pageHeading/pageHeading';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const systems: { value: SelectedSystem; iso: string; nameKey: string }[] = [
  { value: 'sgq', iso: 'ISO 9001', nameKey: 'quality' },
  { value: 'sga', iso: 'ISO 14001', nameKey: 'environment' },
  { value: 'sgsst', iso: 'ISO 45001', nameKey: 'safety' },
];

function errorCode(error: unknown): string | undefined {
  return axios.isAxiosError(error) ? error.response?.data?.error?.code : undefined;
}

export default function AdminCustomers() {
  const { t, i18n } = useTranslation(['admin', 'onboarding']);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSystems, setSelectedSystems] = useState<SelectedSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const requestId = useRef(0);
  const initialLoadStarted = useRef(false);

  const load = useCallback(async (query: string, cursor?: string) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setMessage(null);
    try {
      const result = await adminApi.searchCustomers(query, cursor);
      if (currentRequest !== requestId.current) return;
      setCustomers(previous => cursor ? [...previous, ...result.items] : result.items);
      setNextCursor(result.nextCursor);
      if (!cursor) {
        setActiveSearch(query);
        setEditingId(null);
      }
    } catch {
      if (currentRequest === requestId.current) setMessage({ kind: 'error', text: t('admin:listError') });
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    void Promise.resolve().then(() => load(''));
  }, [load]);

  function searchCustomers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const query = search.trim();
    void load(query);
  }

  function beginEdit(customer: AdminCustomer) {
    if (saving) return;
    setMessage(null);
    setEditingId(customer.userId);
    setSelectedSystems([...customer.selectedSystems]);
  }

  function toggleSystem(system: SelectedSystem) {
    setSelectedSystems(current => current.includes(system)
      ? current.filter(value => value !== system)
      : systems.filter(option => option.value === system || current.includes(option.value)).map(option => option.value));
  }

  async function saveSystems(event: FormEvent<HTMLFormElement>, customer: AdminCustomer) {
    event.preventDefault();
    if (saving) return;
    if (selectedSystems.length === 0) { setMessage({ kind: 'error', text: t('admin:chooseSystem') }); return; }
    // A list request started earlier must not replace the row returned by this mutation.
    requestId.current += 1;
    setLoading(false);
    setSaving(true); setMessage(null);
    try {
      const saved = await adminApi.updateCustomerSystems(customer.userId, selectedSystems, customer.revision);
      setCustomers(current => current.map(item => item.userId === saved.userId ? saved : item));
      setEditingId(null);
      setMessage({ kind: 'success', text: t('admin:systemsSaved') });
    } catch (error) {
      setMessage({ kind: 'error', text: t(errorCode(error) === 'PROFILE_REVISION_CONFLICT' ? 'admin:conflict' : 'admin:saveError') });
    } finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-6xl space-y-6 pb-8">
    <PageHeading title={t('admin:title')} description={t('admin:description')} />
    <Card className="shadow-none"><CardContent><form className="flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={searchCustomers}>
      <div className="field flex-1"><Label htmlFor="admin-customer-search">{t('admin:searchLabel')}</Label><Input id="admin-customer-search" value={search} onChange={event => setSearch(event.target.value)} maxLength={160} disabled={saving} /></div>
      <Button type="submit" disabled={loading || saving}>{t('admin:search')}</Button>
      <Button type="button" variant="outline" disabled={loading || saving} onClick={() => void load(activeSearch)}>{message?.kind === 'error' && customers.length === 0 ? t('admin:tryAgain') : t('admin:refresh')}</Button>
    </form></CardContent></Card>

    {message && <p role={message.kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border p-4 text-base ${message.kind === 'error' ? 'border-destructive/40 text-destructive' : 'border-primary/40 bg-secondary/40'}`}>{message.text}</p>}
    {loading && <p role="status">{t('admin:loading')}</p>}
    {!loading && customers.length === 0 && !message && <p className="text-lg">{t('admin:empty')}</p>}
    <section className="space-y-4" aria-label={t('admin:customerList')}>
      {customers.map(customer => <Card key={customer.userId} className="shadow-none">
        <CardHeader className="space-y-2"><h2 className="text-2xl">{customer.organizationName}</h2><p className="text-base">{t('admin:accountHolder', { name: customer.name })}</p><p className="break-all text-base"><a className="text-link" href={`mailto:${customer.email}`}>{customer.email}</a></p></CardHeader>
        <CardContent className="space-y-5">
          <div><p className="font-semibold">{t('admin:selectedSystems')}</p><p className="text-base">{customer.selectedSystems.map(system => systems.find(option => option.value === system)?.iso ?? system).join(', ')}</p></div>
          <p className="text-base text-muted-foreground">{t('admin:lastUpdated', { date: new Intl.DateTimeFormat(i18n.resolvedLanguage || 'pt-PT', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(customer.updatedAt)) })}</p>
          {editingId === customer.userId ? <form className="space-y-4 border-t pt-5" onSubmit={event => void saveSystems(event, customer)}>
            <fieldset className="space-y-3"><legend className="mb-3 text-lg font-semibold">{t('admin:editFor', { organization: customer.organizationName, email: customer.email })}</legend>
              {systems.map(option => <label key={option.value} className="flex min-h-12 items-center gap-3 rounded-lg border px-4 py-2 text-base">
                <input type="checkbox" className="size-5 accent-primary" checked={selectedSystems.includes(option.value)} onChange={() => toggleSystem(option.value)} disabled={saving} />
                <span>{t(`onboarding:${option.nameKey}`)} — {option.iso}</span>
              </label>)}
            </fieldset>
            <div className="flex flex-wrap gap-3"><Button type="submit" disabled={saving || selectedSystems.length === 0}>{saving ? t('admin:saving') : t('admin:saveSystems')}</Button><Button type="button" variant="outline" disabled={saving} onClick={() => { setEditingId(null); setMessage(null); }}>{t('admin:cancel')}</Button></div>
          </form> : <Button type="button" variant="outline" disabled={saving} onClick={() => beginEdit(customer)}>{t('admin:editSystems', { organization: customer.organizationName })}</Button>}
        </CardContent>
      </Card>)}
    </section>
    {nextCursor && <Button type="button" variant="outline" disabled={loading || saving} onClick={() => void load(activeSearch, nextCursor)}>{t('admin:loadMore')}</Button>}
  </div>;
}
