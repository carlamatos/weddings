'use client';

// Share band shown near the bottom of every theme. With a hashtag it reads
// "Tag your posts / #tag"; without one it's just a "Share this event" title.
// Either way the buttons share the page URL (plus the hashtag where the network
// supports it). Each theme styles .share-band / .share-hashtag in its own CSS
// and passes its own eyebrow and button classes.

import { useState } from 'react';
import type { Translations } from '@/app/lib/translations';
import { SectionText, type SectionTextContext } from './section-text';

type Props = {
  url: string;
  title: string;
  hashtag?: string;
  t: Pick<Translations, 'tagYourPosts' | 'shareThisEvent' | 'copyLink' | 'linkCopied'>;
  eyebrowClassName?: string;
  buttonClassName?: string;
  lowercase?: boolean; // Quiet Coastal writes all its labels in lowercase
  sectionText?: SectionTextContext;
};

const enc = encodeURIComponent;

export default function ShareSection({
  url,
  title,
  hashtag,
  t,
  eyebrowClassName = 'eyebrow',
  buttonClassName = 'btn btn-outline',
  lowercase,
  sectionText,
}: Props) {
  const [copied, setCopied] = useState(false);
  const fmt = (s: string) => (lowercase ? s.toLowerCase() : s);
  const tagText = hashtag ? `#${hashtag}` : '';
  const text = [title, tagText].filter(Boolean).join(' ');

  const links = [
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}${hashtag ? `&hashtag=${enc(tagText)}` : ''}`,
    },
    {
      label: 'X / Twitter',
      href: `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}${hashtag ? `&hashtags=${enc(hashtag)}` : ''}`,
    },
    { label: 'WhatsApp', href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.copyLink, url);
    }
  }

  return (
    <div className="share-band">
      {hashtag && <SectionText ctx={sectionText} k="share.eyebrow" className={eyebrowClassName} fallback={fmt(t.tagYourPosts)} />}
      {hashtag
        ? <h2 className="share-hashtag">{tagText}</h2>
        : <SectionText ctx={sectionText} k="share.title" as="h2" className="share-hashtag" fallback={fmt(t.shareThisEvent)} />}
      <div className="share-row">
        {links.map((l) => (
          <a key={l.label} className={buttonClassName} href={l.href} target="_blank" rel="noopener noreferrer">
            {fmt(l.label)}
          </a>
        ))}
        <button type="button" className={buttonClassName} onClick={copy} aria-live="polite">
          {fmt(copied ? t.linkCopied : t.copyLink)}
        </button>
      </div>
    </div>
  );
}
