import { Fragment, type ReactNode } from 'react';

// Dashboard text with markup in it: rich(d.x.tip, { b: (s) => <strong>{s}</strong> })
// turns "Click <b>Save</b>" into text and elements, so a translation can move
// the bold or the link to wherever its sentence needs it.
export function rich(text: string, tags: Record<string, (chunk: string) => ReactNode>): ReactNode {
  const out: ReactNode[] = [];
  const re = /<(\w+)>(.*?)<\/\1>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const render = tags[m[1]];
    out.push(<Fragment key={m.index}>{render ? render(m[2]) : m[2]}</Fragment>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
