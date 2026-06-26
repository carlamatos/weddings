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
  return (
    <div style={{ marginTop: 24, background: '#FAF9F7', border: '1px solid #EDE8E3', borderRadius: 12, padding: '20px 24px' }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>DNS Configuration</p>
      <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 18px' }}>
        {domain
          ? `Add these records for ${domain} at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):`
          : 'Before adding your domain, configure these DNS records at your registrar (Namecheap, GoDaddy, Cloudflare, etc.):'}
      </p>

      <p style={{ fontSize: 11, fontWeight: 600, color: '#241F2B', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Option A — Apex domain (example.com)
      </p>
      <DnsRecord label="Points the root domain to your event page" type="A" name="@" value="76.76.21.21" />

      <p style={{ fontSize: 11, fontWeight: 600, color: '#241F2B', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Option B — www subdomain (www.example.com)
      </p>
      <DnsRecord label="Points www to your event page" type="CNAME" name="www" value="cname.vercel-dns.com" />

      <p style={{ fontSize: 11, fontWeight: 600, color: '#241F2B', margin: '16px 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Recommended — Both apex + www
      </p>
      <DnsRecord label="Root domain" type="A" name="@" value="76.76.21.21" />
      <DnsRecord label="www subdomain" type="CNAME" name="www" value="cname.vercel-dns.com" />

      <p style={{ fontSize: 12, color: '#9A8F8C', margin: '4px 0 0' }}>
        DNS changes can take up to 48 hours to propagate. SSL is provisioned automatically once the domain is verified.
      </p>
    </div>
  );
}

async function redirectToStripe(endpoint: string, setError: (e: string) => void, setLoading: (l: boolean) => void) {
  setLoading(true);
  setError('');
  try {
    const res = await fetch(endpoint, { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError(data.error || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  } catch {
    setError('Network error. Please try again.');
    setLoading(false);
  }
}

export default function DomainForm({
  initialDomain,
  isPaid,
  hasCustomer,
}: {
  initialDomain: string | null;
  isPaid: boolean;
  hasCustomer: boolean;
}) {
  const [domain, setDomain] = useState<string | null>(initialDomain);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);
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

  // Free plan — greyed-out form + DNS instructions + Upgrade button
  if (!isPaid) {
    return (
      <>
        <div style={{ opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#241F2B', display: 'block', marginBottom: 8 }}>
            Domain name
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="yourdomain.com or www.yourdomain.com"
              disabled
              style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #D8D3CE', fontSize: 14, color: '#241F2B', fontFamily: 'system-ui', background: '#F5F3F0' }}
            />
            <button disabled style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#241F2B', color: '#fff', fontSize: 14, fontWeight: 500 }}>
              Add Domain
            </button>
          </div>
        </div>
        <DnsInstructions domain="" />
        {error && <p style={{ color: '#8B3A2A', fontSize: 13, margin: '12px 0 0' }}>{error}</p>}
        <button
          onClick={() => redirectToStripe('/api/stripe/checkout', setError, setStripeLoading)}
          disabled={stripeLoading}
          style={{
            marginTop: 20, padding: '11px 28px', borderRadius: 8, border: 'none',
            background: '#B6584A', color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: stripeLoading ? 'not-allowed' : 'pointer',
            opacity: stripeLoading ? 0.7 : 1,
          }}
        >
          {stripeLoading ? 'Redirecting…' : 'Upgrade to add your domain'}
        </button>
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
        {hasCustomer && (
          <>
            {error && <p style={{ color: '#8B3A2A', fontSize: 13, margin: '16px 0 0' }}>{error}</p>}
            <button
              onClick={() => redirectToStripe('/api/stripe/portal', setError, setStripeLoading)}
              disabled={stripeLoading}
              style={{
                marginTop: 20, padding: '9px 20px', borderRadius: 8,
                border: '1px solid #D8D3CE', background: '#fff', color: '#241F2B',
                fontSize: 13, fontWeight: 500, cursor: stripeLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {stripeLoading ? 'Redirecting…' : 'Manage Subscription'}
            </button>
          </>
        )}
      </>
    );
  }

  // Paid plan — no domain yet
  return (
    <>
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
            {isPending ? 'Adding…' : 'Add Domain'}
          </button>
        </div>
        {error && <p style={{ color: '#8B3A2A', fontSize: 13, margin: '8px 0 0' }}>{error}</p>}
        <p style={{ fontSize: 12, color: '#9A8F8C', margin: '10px 0 0' }}>
          Enter just the domain — e.g. <code>sarah-and-john.com</code> or <code>www.sarah-and-john.com</code>
        </p>
      </form>
      <DnsInstructions domain="" />
      {hasCustomer && (
        <>
          {error && <p style={{ color: '#8B3A2A', fontSize: 13, margin: '16px 0 0' }}>{error}</p>}
          <button
            onClick={() => redirectToStripe('/api/stripe/portal', setError, setStripeLoading)}
            disabled={stripeLoading}
            style={{
              marginTop: 20, padding: '9px 20px', borderRadius: 8,
              border: '1px solid #D8D3CE', background: '#fff', color: '#241F2B',
              fontSize: 13, fontWeight: 500, cursor: stripeLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {stripeLoading ? 'Redirecting…' : 'Manage Subscription'}
          </button>
        </>
      )}
    </>
  );
}
