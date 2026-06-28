import { auth } from '@/auth';
import { fetchGuests } from '@/app/lib/data';
import { RsvpActions } from './RsvpActions';

const statusLabel: Record<string, string> = {
  attending: 'Attending',
  not_attending: 'Declining',
  invited: 'Invited',
};

const statusStyle: Record<string, React.CSSProperties> = {
  attending:     { background: '#EAF2EC', color: '#3D6B46' },
  not_attending: { background: '#F5EDEA', color: '#8B3A2A' },
  invited:       { background: '#EEF0F8', color: '#4A5296' },
};

export default async function RsvpPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const guests = userId ? await fetchGuests(userId) : [];

  const attending = guests.filter((g) => g.status === 'attending');
  const declining = guests.filter((g) => g.status === 'not_attending');
  const invited   = guests.filter((g) => g.status === 'invited');
  const totalGuests = attending.reduce((sum, g) => sum + (g.guests || 1), 0);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 28px', fontFamily: 'system-ui' }}>Guests</h1>

      <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard label="Attending"       value={attending.length} sub={`${totalGuests} total guest${totalGuests !== 1 ? 's' : ''}`} accent="#5C6B61" />
        <StatCard label="Declining"       value={declining.length} accent="#9A8F8C" />
        <StatCard label="Invited"         value={invited.length}   accent="#4A5296" />
        <StatCard label="Total responses" value={attending.length + declining.length} accent="#3F4A45" />
      </div>

      <RsvpActions guests={guests} />

      {guests.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#9A8F8C', fontFamily: 'system-ui', fontSize: 15 }}>
          No guests yet — share your event page or import contacts to get started.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #EDE8E3', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#FAF9F7', borderBottom: '1px solid #EDE8E3' }}>
                {['Name', 'Email', 'Phone', 'Status', 'Guests', 'Updates', 'Note', 'Date'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, letterSpacing: 0.5, color: '#6B6470', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map((g, i) => (
                <tr key={g.id} style={{ borderBottom: i < guests.length - 1 ? '1px solid #F0ECE8' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: '#241F2B' }}>{g.name}</td>
                  <td style={{ padding: '14px 16px', color: '#6B6470' }}>{g.email || '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#6B6470' }}>{g.phone || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, ...statusStyle[g.status] }}>
                      {statusLabel[g.status]}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: '#241F2B' }}>
                    {g.status === 'attending' ? g.guests : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: g.receive_updates ? '#3D6B46' : '#9A8F8C' }}>
                    {g.status !== 'invited' ? (g.receive_updates ? '✓' : '—') : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9A8F8C', maxWidth: 200 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {g.message || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9A8F8C', whiteSpace: 'nowrap', fontSize: 13 }}>
                    {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: '18px 24px', minWidth: 150 }}>
      <p style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#9A8F8C', margin: '0 0 6px', fontFamily: 'system-ui', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: 30, fontWeight: 700, color: accent, margin: 0, fontFamily: 'system-ui', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: '#9A8F8C', margin: '4px 0 0', fontFamily: 'system-ui' }}>{sub}</p>}
    </div>
  );
}
