import { c } from './styles';

// "Total" line shown above each admin table.
export default function Total({ label, count, of }: { label: string; count: number | null; of?: number | null }) {
  if (count === null) return null;
  const filtered = of != null && of !== count;
  return (
    <p style={{ margin: '0 0 12px', fontSize: 13, color: c.soft }}>
      <strong style={{ fontSize: 18, color: c.ink }}>{count}</strong> {label}
      {filtered && <span> match these filters (of {of} total)</span>}
    </p>
  );
}
