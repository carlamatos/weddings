'use client';

import { useRef, useState } from 'react';
import type { CustomSection, CustomSectionBlock } from '@/app/lib/definitions';
import { saveCustomSection } from '@/app/lib/actions';
import {
  CUSTOM_SECTION_MAX_BLOCKS,
  CUSTOM_SECTION_TEXT_MAX,
  CUSTOM_SECTION_TITLE_MAX,
  IMAGE_ALT_MAX,
} from '@/app/lib/custom-sections';
import { uploadImage } from './upload-image';

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', border: '1px solid #EDE8E3', borderRadius: 8, fontSize: 14,
  fontFamily: 'inherit', color: '#241F2B', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const btnPrimary: React.CSSProperties = {
  padding: '9px 20px', borderRadius: 8, border: 'none', background: '#B6584A', color: '#fff',
  fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
};
const btnGhost: React.CSSProperties = {
  padding: '8px 14px', borderRadius: 8, border: '1px solid #EDE8E3', background: '#fff', color: '#241F2B',
  fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
};
const iconBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 6, border: '1px solid #EDE8E3', background: '#fff', color: '#6B6470',
  cursor: 'pointer', fontSize: 14, lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6B6470', marginBottom: 6,
};

// Blocks carry a client-only key so React can track them while they move.
type DraftBlock = CustomSectionBlock & { key: string };

let nextKey = 0;
const withKey = (b: CustomSectionBlock): DraftBlock => ({ ...b, key: `b${nextKey++}` });
const stripKey = ({ key: _key, ...b }: DraftBlock): CustomSectionBlock => b; // eslint-disable-line @typescript-eslint/no-unused-vars

export function CustomSectionsManager({ pageId, initialSections }: { pageId: number; initialSections: CustomSection[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 760 }}>
      {initialSections.map((section) => (
        <SectionEditor key={section.position} pageId={pageId} initial={section} />
      ))}
    </div>
  );
}

function SectionEditor({ pageId, initial }: { pageId: number; initial: CustomSection }) {
  const [title, setTitle] = useState(initial.title);
  const [blocks, setBlocks] = useState<DraftBlock[]>(() => initial.blocks.map(withKey));
  const [saved, setSaved] = useState(() => JSON.stringify({ title: initial.title, blocks: initial.blocks }));
  const [isEmpty, setIsEmpty] = useState(!initial.title && initial.blocks.length === 0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const current = JSON.stringify({ title: title.trim(), blocks: blocks.map(stripKey) });
  const dirty = current !== saved;
  const atLimit = blocks.length >= CUSTOM_SECTION_MAX_BLOCKS;

  function update(key: string, patch: Partial<CustomSectionBlock>) {
    setBlocks((prev) => prev.map((b) => (b.key === key ? ({ ...b, ...patch } as DraftBlock) : b)));
    setMessage(null);
  }

  function move(index: number, delta: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setMessage(null);
  }

  function remove(key: string) {
    setBlocks((prev) => prev.filter((b) => b.key !== key));
    setMessage(null);
  }

  function addText() {
    setBlocks((prev) => [...prev, withKey({ type: 'text', text: '' })]);
    setMessage(null);
  }

  async function addImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, CUSTOM_SECTION_MAX_BLOCKS - blocks.length);
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    setMessage(null);
    try {
      for (const file of files) {
        const url = await uploadImage(file);
        setBlocks((prev) => [...prev, withKey({ type: 'image', url })]);
      }
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Upload failed. Please try again.' });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const result = await saveCustomSection(pageId, initial.position, { title, blocks: blocks.map(stripKey) });
    setSaving(false);
    if (!result.ok) {
      setMessage({ kind: 'error', text: result.error });
      return;
    }
    // The server trims text and drops empty paragraphs; show what was stored.
    setTitle(result.value.title);
    setBlocks(result.value.blocks.map(withKey));
    setSaved(JSON.stringify({ title: result.value.title, blocks: result.value.blocks }));
    setIsEmpty(!result.value.title && result.value.blocks.length === 0);
    setMessage({ kind: 'ok', text: 'Saved.' });
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #EDE8E3', borderRadius: 12, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#241F2B', margin: 0 }}>Section {initial.position}</h2>
        <span style={{ fontSize: 12, color: isEmpty ? '#6B6470' : '#3D6B46', fontWeight: 600 }}>
          {isEmpty ? 'Empty — not shown on your page' : 'Shown on your page'}
        </span>
      </div>

      <label style={labelStyle} htmlFor={`cs-title-${initial.position}`}>Title (optional)</label>
      <input
        id={`cs-title-${initial.position}`}
        style={{ ...inputStyle, marginBottom: 18 }}
        value={title}
        maxLength={CUSTOM_SECTION_TITLE_MAX}
        placeholder="Leave empty for no heading"
        onChange={(e) => { setTitle(e.target.value); setMessage(null); }}
      />

      <span style={labelStyle}>Content</span>
      {blocks.length === 0 && (
        <p style={{ fontSize: 13, color: '#6B6470', margin: '0 0 14px' }}>Add paragraphs of text and images. They appear on your page in this order.</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
        {blocks.map((block, i) => (
          <div key={block.key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, border: '1px solid #EDE8E3', borderRadius: 10, background: '#faf8f6' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {block.type === 'text' ? (
                <>
                  <textarea
                    style={{ ...inputStyle, minHeight: 96, resize: 'vertical', background: '#fff' }}
                    value={block.text}
                    maxLength={CUSTOM_SECTION_TEXT_MAX}
                    placeholder="Write a paragraph…"
                    aria-label={`Text block ${i + 1}`}
                    onChange={(e) => update(block.key, { text: e.target.value })}
                  />
                  {block.text.length > CUSTOM_SECTION_TEXT_MAX - 200 && (
                    <p style={{ fontSize: 11, color: '#6B6470', margin: '4px 0 0' }}>{block.text.length} / {CUSTOM_SECTION_TEXT_MAX}</p>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={block.url} alt="" style={{ width: 140, height: 94, objectFit: 'cover', borderRadius: 6, border: '1px solid #EDE8E3', background: '#fff' }} />
                  <input
                    style={{ ...inputStyle, flex: 1, minWidth: 180, background: '#fff' }}
                    value={block.alt ?? ''}
                    maxLength={IMAGE_ALT_MAX}
                    placeholder="Describe the image (for screen readers)"
                    aria-label={`Image ${i + 1} description`}
                    onChange={(e) => update(block.key, { alt: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button type="button" style={iconBtn} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" title="Move up">↑</button>
              <button type="button" style={iconBtn} onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label="Move down" title="Move down">↓</button>
              <button type="button" style={{ ...iconBtn, color: '#B91C1C' }} onClick={() => remove(block.key)} aria-label="Remove" title="Remove">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" style={btnGhost} onClick={addText} disabled={atLimit}>+ Text</button>
        <button type="button" style={btnGhost} onClick={() => fileRef.current?.click()} disabled={atLimit || uploading}>
          {uploading ? 'Uploading…' : '+ Image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addImages} />
        <span style={{ flex: 1 }} />
        {message && (
          <span role="status" style={{ fontSize: 13, color: message.kind === 'ok' ? '#3D6B46' : '#B91C1C' }}>{message.text}</span>
        )}
        <button type="button" style={{ ...btnPrimary, opacity: !dirty || saving || uploading ? 0.55 : 1 }} onClick={save} disabled={!dirty || saving || uploading}>
          {saving ? 'Saving…' : 'Save section'}
        </button>
      </div>
      {atLimit && <p style={{ fontSize: 12, color: '#6B6470', margin: '10px 0 0' }}>A section can hold up to {CUSTOM_SECTION_MAX_BLOCKS} blocks.</p>}
    </div>
  );
}
