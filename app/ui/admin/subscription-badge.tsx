import { c } from './styles';
import { formatDate } from './format';

const pill = {
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: 'nowrap',
} as const;

// The at-a-glance answer to "is this person paying, and until when?"
export default function SubscriptionBadge({
  planType,
  periodEnd,
  cancelAtPeriodEnd,
}: {
  planType: string;
  periodEnd: Date | string | null;
  cancelAtPeriodEnd: boolean;
}) {
  if (planType !== 'paid') {
    return <span style={{ ...pill, background: c.greyBg, color: c.grey }}>Free</span>;
  }

  if (periodEnd && cancelAtPeriodEnd) {
    return (
      <span>
        <span style={{ ...pill, background: c.amberBg, color: c.amber }}>Paid · ends {formatDate(periodEnd)}</span>
        <span style={{ display: 'block', fontSize: 11, color: c.muted, marginTop: 4 }}>
          Active subscription, cancelled — won&apos;t renew
        </span>
      </span>
    );
  }

  return (
    <span>
      <span style={{ ...pill, background: c.greenBg, color: c.green }}>
        Paid · {periodEnd ? `renews ${formatDate(periodEnd)}` : 'renewal date unavailable'}
      </span>
      <span style={{ display: 'block', fontSize: 11, color: c.muted, marginTop: 4 }}>Active subscription</span>
    </span>
  );
}
