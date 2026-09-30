'use client';

import { useEffect, useState } from 'react';
import { EnvelopeIcon, ChatBubbleLeftIcon, LinkIcon, CheckIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';

type Network = {
  name: string;
  color: string;
  href: (p: { url: string; title: string; text: string; shareImage: string; hashtag?: string }) => string;
};

const enc = encodeURIComponent;

// Each network's public "share a link" intent URL. Networks read the preview
// (banner image, title, description) from the page's Open Graph tags;
// Pinterest is the exception and takes the image explicitly.
const NETWORKS: Network[] = [
  { name: 'Facebook', color: '#1877F2', href: ({ url, hashtag }) => `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}${hashtag ? `&hashtag=${enc(`#${hashtag}`)}` : ''}` },
  { name: 'X', color: '#000000', href: ({ url, title, hashtag }) => `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}${hashtag ? `&hashtags=${enc(hashtag)}` : ''}` },
  { name: 'WhatsApp', color: '#25D366', href: ({ text }) => `https://wa.me/?text=${enc(text)}` },
  { name: 'Messenger', color: '#0084FF', href: ({ url }) => `fb-messenger://share/?link=${enc(url)}` },
  { name: 'LinkedIn', color: '#0A66C2', href: ({ url }) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
  { name: 'Pinterest', color: '#E60023', href: ({ url, title, shareImage: image }) => `https://pinterest.com/pin/create/button/?url=${enc(url)}&media=${enc(image)}&description=${enc(title)}` },
  { name: 'Reddit', color: '#FF4500', href: ({ url, title }) => `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}` },
  { name: 'Telegram', color: '#26A5E4', href: ({ url, title }) => `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}` },
  { name: 'Threads', color: '#000000', href: ({ text }) => `https://www.threads.net/intent/post?text=${enc(text)}` },
  { name: 'Bluesky', color: '#0085FF', href: ({ text }) => `https://bsky.app/intent/compose?text=${enc(text)}` },
];

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 600,
  textDecoration: 'none', border: 'none', cursor: 'pointer', color: '#fff', lineHeight: 1.2,
};
const outlineBtn: React.CSSProperties = { ...btn, background: '#fff', color: '#241F2B', border: '1px solid #DDD5CE' };
const iconSize = { width: 18, height: 18 };

export function ShareButtons({ url, title, description, image, shareImage, hashtag }: {
  url: string;
  title: string;
  description?: string;
  image: string; // shown in the preview card (may be a site path)
  shareImage: string; // absolute URL, for networks that take the image directly
  hashtag?: string; // no leading '#'
}) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const text = [title, hashtag && `#${hashtag}`, url].filter(Boolean).join(' ');
  const params = { url, title, text, shareImage, hashtag };

  useEffect(() => {
    // Read after mount so the server render and first client render match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator.share === 'function');
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: title, url });
    } catch {
      // Dismissed by the user — nothing to do.
    }
  }

  const emailHref = `mailto:?subject=${enc(title)}&body=${enc(`${description ? `${description}\n\n` : ''}${url}`)}`;
  const smsHref = `sms:?&body=${enc(text)}`;
  // Messenger's share intent only works from the mobile app.
  const networks = NETWORKS.filter((n) => n.name !== 'Messenger' || isMobile);

  return (
    <div>
      {/* Link preview, roughly as social networks will draw it */}
      <div style={{ border: '1px solid #EDE8E3', borderRadius: 12, overflow: 'hidden', background: '#fff', maxWidth: 520, marginBottom: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" style={{ display: 'block', width: '100%', aspectRatio: '1.91 / 1', objectFit: 'cover', background: '#f3efeb' }} />
        <div style={{ padding: '12px 16px', background: '#faf8f6' }}>
          <div style={{ fontSize: 12, color: '#8A838F', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            {url.replace(/^https?:\/\//, '').split('/')[0]}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', marginTop: 2 }}>{title}</div>
          {description && (
            <div style={{ fontSize: 13, color: '#6B6470', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {description}
            </div>
          )}
        </div>
      </div>

      {/* Page link + copy */}
      <label htmlFor="share-url" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#241F2B', marginBottom: 6 }}>
        Your page link
      </label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          id="share-url"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          style={{ flex: '1 1 240px', minWidth: 0, padding: '10px 12px', border: '1px solid #DDD5CE', borderRadius: 8, fontSize: 14, color: '#241F2B', background: '#fff' }}
        />
        <button type="button" onClick={copy} style={{ ...btn, background: '#B6584A' }}>
          {copied ? <CheckIcon style={iconSize} /> : <LinkIcon style={iconSize} />}
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>

      <div style={{ fontSize: 13, fontWeight: 600, color: '#241F2B', marginBottom: 10 }}>Share on</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {networks.map((n) => (
          <a
            key={n.name}
            href={n.href(params)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...btn, background: n.color }}
          >
            {n.name}
          </a>
        ))}
        <a href={emailHref} style={outlineBtn}>
          <EnvelopeIcon style={iconSize} />
          Email
        </a>
        <a href={smsHref} style={outlineBtn}>
          <ChatBubbleLeftIcon style={iconSize} />
          Text message
        </a>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} style={outlineBtn}>
            <ArrowUpOnSquareIcon style={iconSize} />
            More apps…
          </button>
        )}
      </div>
      <p style={{ fontSize: 13, color: '#6B6470', marginTop: 12, lineHeight: 1.6 }}>
        Instagram and TikTok don&rsquo;t accept shared links from the web. Copy your link into your bio or story{canNativeShare ? ', or use “More apps…” on your phone' : ''}.
      </p>
    </div>
  );
}
