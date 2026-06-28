'use client';

import { useRef, useState } from 'react';
import type { Guest } from '@/app/lib/definitions';

type Contact = { name: string; email?: string; phone?: string };

function parseVCard(text: string): Contact[] {
  const contacts: Contact[] = [];
  const cards = text.split(/BEGIN:VCARD/i);
  for (const card of cards) {
    if (!card.trim()) continue;
    const name = card.match(/^FN[^:]*:(.+)$/m)?.[1]?.trim();
    const email = card.match(/^EMAIL[^:]*:(.+)$/m)?.[1]?.trim();
    const phone = card.match(/^TEL[^:]*:(.+)$/m)?.[1]?.replace(/\s+/g, '').trim();
    if (name) contacts.push({ name, email, phone });
  }
  return contacts;
}

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
  fontFamily: 'system-ui', cursor: 'pointer', border: '1px solid #EDE8E3',
  background: '#fff', color: '#241F2B', whiteSpace: 'nowrap',
};

export function RsvpActions({ guests }: { guests: Guest[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  function downloadCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Guests', 'Updates', 'Note', 'Date'];
    const rows = guests.map((g) => [
      g.name,
      g.email ?? '',
      g.phone ?? '',
      g.status === 'attending' ? 'Attending' : g.status === 'not_attending' ? 'Declining' : 'Invited',
      g.status === 'attending' ? String(g.guests) : '',
      g.receive_updates ? 'Yes' : 'No',
      g.message ?? '',
      new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'guests.csv';
    a.click();
  }

  async function saveContacts(contacts: Contact[]) {
    if (!contacts.length) return;
    setImporting(true);
    try {
      const res = await fetch('/api/invitees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error ?? 'Import failed.');
      }
    } finally {
      setImporting(false);
    }
  }

  async function importContacts() {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const picked = await (navigator as any).contacts.select(['name', 'email', 'tel'], { multiple: true });
        const contacts: Contact[] = picked.map((c: { name?: string[]; email?: string[]; tel?: string[] }) => ({
          name: c.name?.[0] ?? 'Unknown',
          email: c.email?.[0],
          phone: c.tel?.[0],
        }));
        await saveContacts(contacts);
        return;
      } catch {
        // User cancelled — fall through to file picker
      }
    }
    fileRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const contacts = parseVCard(text);
    e.target.value = '';
    if (!contacts.length) {
      alert('No contacts found in the file. Make sure it is a .vcf vCard file.');
      return;
    }
    await saveContacts(contacts);
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
      <button onClick={downloadCSV} style={btn} title="Download all guests as CSV">
        ↓ Export CSV
      </button>
      <button onClick={importContacts} disabled={importing} style={{ ...btn, background: importing ? '#F5F3F1' : '#fff' }}>
        {importing ? 'Importing…' : '+ Import Contacts'}
      </button>
      <input ref={fileRef} type="file" accept=".vcf,text/vcard" onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}
