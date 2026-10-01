'use client';

import { useEffect, useState } from 'react';
import type { Livestream } from '@/app/lib/livestream';

// The body of the Plus live stream section: the embedded player (or a
// "Watch live" button when it can't be embedded), plus the owner's message.
// Each theme wraps it in its own section markup and heading, and passes its
// registry button class so the button matches the theme.
export function LivestreamContent({
  livestream,
  labels,
  buttonClassName,
  textStyle,
  linkStyle,
  align = 'center',
}: {
  livestream: Livestream;
  labels: { watchLive: string; openStream: string };
  buttonClassName: string;
  textStyle?: React.CSSProperties;
  linkStyle?: React.CSSProperties;
  align?: 'center' | 'left';
}) {
  const centered = align === 'center';
  const src = usePlayerSrc(livestream.embedUrl);

  return (
    <div style={{ maxWidth: 820, margin: centered ? '0 auto' : 0, textAlign: centered ? 'center' : 'left' }}>
      {livestream.message && (
        <p style={{ whiteSpace: 'pre-line', maxWidth: 620, margin: centered ? '0 auto 24px' : '0 0 24px', ...textStyle }}>
          {livestream.message}
        </p>
      )}
      {livestream.embedUrl ? (
        <>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
            {src && (
              <iframe
                src={src}
                title={labels.watchLive}
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            )}
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 14 }}>
            <a href={livestream.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', ...textStyle, ...linkStyle }}>
              {livestream.buttonText || labels.openStream}
            </a>
          </p>
        </>
      ) : (
        <a href={livestream.url} target="_blank" rel="noopener noreferrer" className={buttonClassName}>
          {livestream.buttonText || labels.watchLive}
        </a>
      )}
    </div>
  );
}

// Twitch only plays inside pages it is told about (parent=<hostname>), which
// is only known in the browser — so that player waits until mount.
function usePlayerSrc(embedUrl?: string): string | null {
  const needsParent = !!embedUrl && embedUrl.startsWith('https://player.twitch.tv/');
  const [src, setSrc] = useState<string | null>(needsParent ? null : embedUrl ?? null);
  useEffect(() => {
    if (!embedUrl || !needsParent) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSrc(`${embedUrl}&parent=${encodeURIComponent(window.location.hostname)}`);
  }, [embedUrl, needsParent]);
  return needsParent ? src : embedUrl ?? null;
}
