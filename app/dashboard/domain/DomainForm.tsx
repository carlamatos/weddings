'use client';

import { useState, useTransition } from 'react';
import { saveDomain, removeDomain } from '@/app/lib/actions';

function DnsRecord({ label, type, name, value }: { label: string; type: string; name: string; value: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 11, color: '#9A8F8C', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 80px 1fr', gap: 8 }}>
        {([['Type', type], ['Name', name], ['Value', value]] as [string, string][]).map(([k, v]) => (
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
  const isWww = domain.startsWith('www.');
  return (
    <div style={{ marginTop: 24, background: '#FAF9F7', border: '1px solid #EDE8E3', borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>DNS Configuration</p>
      <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 18px' }}>
        Add the following record{!isWww ? 's' : ''} at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):
      </p>
      {!isWww && <DnsRecord label="Apex domain" type="A" name="@" value="76.76.21.21" />}
      <DnsRecord
        label={isWww ? 'www subdomain' : 'www subdomain (optional)'}
        type="CNAME"
        name="www"
        value="cname.vercel-dns.com"
      />
      <p style={{ fontSize: 12, color: '#9A8F8C', margin: '12px 0 0' }}>
        DNS changes can take up to 48 hours to propagate. SSL is provisioned automatically once Vercel verifies the domain.
      </p>
    </div>
  );
}

export default function DomainForm({ initialDomain }: { initialDomain: string | null }) {
  const [domain, setDomain] = useState<string | null>(initialDomain);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const result = await saveDomain(input);
      if (result.error) {
        setError(result.error);
      } else {
        const clean = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        setDomain(clean);
        setInput('');
      }
    });
  }

  function handleRemove() {
    startRemoveTransition(async () => {
      const result = await removeDomain();
      if (!result.error) setDomain(null);
    });
  }

  if (domain) {
    return (
      <>
        <div style={{
          background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12,
          padding: '20px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
        }}>
          <div>
            <p style={{ fontSize: 11, color: '#9A8F8C', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Your Domain</p>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#241F2B', margin: 0 }}>{domain}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: '#FFF8E7', color: '#8A6800' }}>
              Pending DNS
            </span>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #E0D5D0', background: '#fff', color: '#8B3A2A', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
            >
              {isRemoving ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
        <DnsInstructions domain={domain} />
      </>
    );
  }

  return (
    <form onSubmit={handleAdd}>
      <label style={{ fontSize: 13, fontWeight: 500, color: '#241F2B', display: 'block', marginBottom: 8 }}>
        Domain name
      </label>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          placeholder="yourdomain.com or www.yourdomain.com"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #D8D3CE',
            fontSize: 14, color: '#241F2B', outline: 'none', fontFamily: 'system-ui',
          }}
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
          {isPending ? 'Adding…' : 'Add Domain'}
        </button>
      </div>
      {error && <p style={{ color: '#8B3A2A', fontSize: 13, margin: '8px 0 0' }}>{error}</p>}
      <p style={{ fontSize: 12, color: '#9A8F8C', margin: '10px 0 0' }}>
        Enter just the domain — e.g. <code>sarah-and-john.com</code> or <code>www.sarah-and-john.com</code>
      </p>
    </form>
  );
}
