import { auth } from '@/auth';
import { fetchRsvps, fetchInvitees } from '@/app/lib/data';
import { RsvpActions } from './RsvpActions';

export default async function RsvpPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const rsvps = userId ? await fetchRsvps(userId) : [];
  const invitees = userId ? await fetchInvitees(userId) : [];

  const attending = rsvps.filter((r) => r.status === 'attending');
  const declining = rsvps.filter((r) => r.status === 'not_attending');
  const totalGuests = attending.reduce((sum, r) => sum + (r.guests || 1), 0);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 28px', fontFamily: 'system-ui' }}>RSVPs</h1>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard label="Attending" value={attending.length} sub={`${totalGuests} total guest${totalGuests !== 1 ? 's' : ''}`} accent="#5C6B61" />
        <StatCard label="Declining" value={declining.length} accent="#9A8F8C" />
        <StatCard label="Total responses" value={rsvps.length} accent="#3F4A45" />
        <StatCard label="Invited" value={invitees.length} accent="#7B6FA0" />
      </div>

      <RsvpActions rsvps={rsvps} />

      {rsvps.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#9A8F8C', fontFamily: 'system-ui', fontSize: 15 }}>
          No RSVPs yet — share your event page to get responses.
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
              {rsvps.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: i < rsvps.length - 1 ? '1px solid #F0ECE8' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500, color: '#241F2B' }}>{r.name}</td>
                  <td style={{ padding: '14px 16px', color: '#6B6470' }}>{r.email}</td>
                  <td style={{ padding: '14px 16px', color: '#6B6470' }}>{r.phone || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: r.status === 'attending' ? '#EAF2EC' : '#F5EDEA',
                      color: r.status === 'attending' ? '#3D6B46' : '#8B3A2A',
                    }}>
                      {r.status === 'attending' ? 'Attending' : 'Declining'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: '#241F2B' }}>
                    {r.status === 'attending' ? r.guests : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: r.receive_updates ? '#3D6B46' : '#9A8F8C' }}>
                    {r.receive_updates ? '✓' : '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9A8F8C', maxWidth: 200 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.message || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#9A8F8C', whiteSpace: 'nowrap', fontSize: 13 }}>
                    {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invitees section */}
      {invitees.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: '0 0 16px', fontFamily: 'system-ui' }}>
            Invited Guests <span style={{ fontSize: 13, fontWeight: 400, color: '#9A8F8C' }}>({invitees.length})</span>
          </h2>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #EDE8E3', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'system-ui', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#FAF9F7', borderBottom: '1px solid #EDE8E3' }}>
                  {['Name', 'Email', 'Phone', 'Added'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, letterSpacing: 0.5, color: '#6B6470', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invitees.map((inv, i) => (
                  <tr key={inv.id} style={{ borderBottom: i < invitees.length - 1 ? '1px solid #F0ECE8' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: '#241F2B' }}>{inv.name}</td>
                    <td style={{ padding: '14px 16px', color: '#6B6470' }}>{inv.email || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#6B6470' }}>{inv.phone || '—'}</td>
                    <td style={{ padding: '14px 16px', color: '#9A8F8C', whiteSpace: 'nowrap', fontSize: 13 }}>
                      {new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
