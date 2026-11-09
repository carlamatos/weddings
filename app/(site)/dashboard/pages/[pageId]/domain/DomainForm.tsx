'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { saveDomain, removeDomain } from '@/app/lib/actions';
import { PlusLock, usePlus } from '@/app/ui/dashboard/plus-gate';

import { useDashText } from '@/app/ui/dashboard/dash-text';
import { fill } from '@/app/lib/dash-text/fill';
import { rich } from '@/app/ui/dashboard/rich';
const VERCEL_IP = '216.150.1.1';
const VERCEL_CNAME = '842c52a8e96459ec.vercel-dns-017.com';

function DnsRecord({ label, type, name, value }: { label: string; type: string; name: string; value: string }) {
  const d = useDashText();
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, color: '#9A8F8C', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr', gap: 8 }}>
        {([[d.domainDomainForm.type, type], [d.domainDomainForm.name, name], [d.domainDomainForm.value, value]] as [string, string][]).map(([k, v]) => (
          <div key={k} style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 8, padding: '8px 12px' }}>
            <p style={{ fontSize: 10, color: '#9A8F8C', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</p>
            <p style={{ fontSize: 13, color: '#241F2B', margin: 0, fontFamily: 'monospace', wordBreak: 'break-all' }}>{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DnsInstructions({ domain }: { domain: string }) {
  const d = useDashText();
  return (
    <div style={{ marginTop: 24, background: '#FAF9F7', border: '1px solid #EDE8E3', borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>{d.domainDomainForm.dnsConfiguration}</p>
      <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 18px' }}>
        {domain
          ? fill(d.domainDomainForm.addTheseRecordsForAt, { domain })
          : d.domainDomainForm.beforeAddingYourDomainConfigure}
      </p>

      <p style={{ fontSize: 11, fontWeight: 600, color: '#241F2B', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {d.domainDomainForm.optionAApexDomainExample}
      </p>
      <DnsRecord label={d.domainDomainForm.pointsTheRootDomainTo} type="A" name="@" value={VERCEL_IP} />

      <p style={{ fontSize: 11, fontWeight: 600, color: '#241F2B', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {d.domainDomainForm.optionBWwwSubdomainWww}
      </p>
      <DnsRecord label={d.domainDomainForm.pointsWwwToYourEvent} type="CNAME" name="www" value={VERCEL_CNAME} />

      <p style={{ fontSize: 11, fontWeight: 600, color: '#241F2B', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {d.domainDomainForm.recommendedBothApexWww}
      </p>
      <DnsRecord label={d.domainDomainForm.rootDomain} type="A" name="@" value={VERCEL_IP} />
      <DnsRecord label={d.domainDomainForm.wwwSubdomain} type="CNAME" name="www" value={VERCEL_CNAME} />

      <p style={{ fontSize: 12, color: '#9A8F8C', margin: '4px 0 0' }}>
        {d.domainDomainForm.dnsChangesCanTakeUp}
      </p>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const d = useDashText();
  return isActive ? (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#EAF2EC', color: '#3D6B46' }}>
      {d.domainDomainForm.active}
    </span>
  ) : (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#FFF8E7', color: '#8A6800' }}>
      {d.domainDomainForm.pendingDns}
    </span>
  );
}

export default function DomainForm({
  pageId,
  initialDomain,
  initialStatus,
  isPaid,
}: {
  pageId: number;
  initialDomain: string | null;
  initialStatus: string;
  isPaid: boolean;
}) {
  const d = useDashText();
  const [domain, setDomain] = useState<string | null>(initialDomain);
  const [status, setStatus] = useState(initialStatus);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const plus = usePlus();
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/domain/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.status) setStatus(data.status);
    } finally {
      setChecking(false);
    }
  }, [pageId]);

  // Auto-check whenever a domain becomes pending (on mount, and right after adding one)
  useEffect(() => {
    if (domain && status === 'pending') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: fetching live DNS status, not mirroring a prop
      checkStatus();
    }
  }, [domain, status, checkStatus]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await saveDomain(pageId, input);
      if (result.error) {
        setError(result.error);
      } else {
        const clean = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        setDomain(clean);
        setStatus('pending');
        setInput('');
      }
    });
  }

  function handleRemove() {
    startRemoveTransition(async () => {
      const result = await removeDomain(pageId);
      if (!result.error) {
        setDomain(null);
        setStatus('pending');
      }
    });
  }

  const isActive = status === 'active';

  // Free plan: the form works as usual up to connecting, which asks for Plus.
  if (!isPaid) {
    return (
      <>
        <form onSubmit={(e) => { e.preventDefault(); plus.ask({ section: '/domain' }); }}>
          <label htmlFor="domain-input" style={{ fontSize: 13, fontWeight: 500, color: '#241F2B', display: 'block', marginBottom: 8 }}>
            {d.domainDomainForm.domainName}
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              id="domain-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={d.domainDomainForm.yourdomainComOrWwwYourdomain}
              style={{ flex: '1 1 240px', padding: '10px 14px', borderRadius: 8, border: '1px solid #D8D3CE', fontSize: 14, color: '#241F2B', fontFamily: 'system-ui', background: '#fff' }}
            />
            <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#241F2B', color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              <PlusLock />{d.domainDomainForm.connectDomain}
            </button>
          </div>
        </form>
        <DnsInstructions domain={input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '')} />
      </>
    );
  }

  // Paid plan — domain already added
  if (domain) {
    return (
      <>
        <div style={{
          background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12,
          padding: '20px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: 11, color: '#9A8F8C', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>{d.domainDomainForm.yourDomain}</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: 0 }}>{domain}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <StatusBadge isActive={isActive} />
            <button
              onClick={checkStatus}
              disabled={checking}
              title={d.domainDomainForm.reCheckDomainStatus}
              style={{
                padding: '5px 12px', borderRadius: 8, border: '1px solid #D8D3CE',
                background: '#fff', color: '#241F2B', fontSize: 12, fontWeight: 500,
                cursor: checking ? 'not-allowed' : 'pointer', opacity: checking ? 0.6 : 1,
              }}
            >
              {checking ? d.domainDomainForm.checking : d.domainDomainForm.refresh}
            </button>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E0D5D0', background: '#fff', color: '#8B3A2A', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              {isRemoving ? d.domainDomainForm.removing : d.domainDomainForm.remove}
            </button>
          </div>
        </div>

        {isActive && (
          <div style={{ marginTop: 12, padding: '12px 16px', background: '#EAF2EC', border: '1px solid #B2D4B8', borderRadius: 10, fontSize: 13, color: '#3D6B46' }}>
            {rich(fill(d.domainDomainForm.yourDomainIsLiveGuests, { domain }), { t0: (s) => <strong>{s}</strong> })}
          </div>
        )}

        <DnsInstructions domain={domain} />
      </>
    );
  }

  // Paid plan — no domain yet
  return (
    <>
      <form onSubmit={handleAdd}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#241F2B', display: 'block', marginBottom: 8 }}>
          {d.domainDomainForm.domainName}
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder={d.domainDomainForm.yourdomainComOrWwwYourdomain}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #D8D3CE', fontSize: 14, color: '#241F2B', outline: 'none', fontFamily: 'system-ui' }}
          />
          <button
            type="submit"
            disabled={isPending || !input.trim()}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: '#241F2B', color: '#fff', fontSize: 14, fontWeight: 500,
              cursor: isPending || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: isPending || !input.trim() ? 0.5 : 1,
            }}
          >
            {isPending ? d.domainDomainForm.adding : d.domainDomainForm.addDomain}
          </button>
        </div>
        {error && <p style={{ color: '#8B3A2A', fontSize: 13, margin: '8px 0 0' }}>{error}</p>}
        <p style={{ fontSize: 12, color: '#9A8F8C', margin: '10px 0 0' }}>
          {rich(d.domainDomainForm.enterJustTheDomainE, { t0: (s) => <code>{s}</code>, t1: (s) => <code>{s}</code> })}
        </p>
      </form>
      <DnsInstructions domain="" />
    </>
  );
}
