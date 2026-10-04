import LegalLayout from '@/app/ui/legal-layout';

export const metadata = {
  title: 'Open-Source Licences — MyGala',
  description: 'The open-source software MyGala uses, with its licences and where to get the source code.',
};

const UPDATED = 'October 4, 2026';
const CONTACT_EMAIL = 'info@mygala.ca';
const LGPL = 'https://www.gnu.org/licenses/lgpl-3.0.html';
const GPL = 'https://www.gnu.org/licenses/gpl-3.0.html';

// Libraries MyGala sends to visitors' browsers under a licence that asks for
// a notice and the source code. Keep the versions in step with package.json
// (heic-to) and the libraries its release bundles (see its README).
const LIBRARIES: { name: string; version: string; use: string; licence: string; licenceUrl: string; source: string; copyright: string }[] = [
  {
    name: 'heic-to',
    version: '1.6.5',
    use: 'Converts HEIC/HEIF photos (from iPhones and some Android phones) to WebP in your browser before they’re uploaded.',
    licence: 'GNU Lesser General Public License v3.0 or later',
    licenceUrl: LGPL,
    source: 'https://github.com/hoppergee/heic-to/tree/v1.6.5',
    copyright: 'Copyright © heic-to contributors',
  },
  {
    name: 'libheif',
    version: '1.23.5',
    use: 'Reads HEIC/HEIF image files. Included in heic-to.',
    licence: 'GNU Lesser General Public License v3.0',
    licenceUrl: LGPL,
    source: 'https://github.com/strukturag/libheif/releases/tag/v1.23.5',
    copyright: 'Copyright © struktur AG, Dirk Farin',
  },
  {
    name: 'libde265',
    version: '1.0.16',
    use: 'Decodes the HEVC image data inside HEIC files. Included in heic-to.',
    licence: 'GNU Lesser General Public License v3.0',
    licenceUrl: LGPL,
    source: 'https://github.com/strukturag/libde265/releases/tag/v1.0.16',
    copyright: 'Copyright © struktur AG, Dirk Farin',
  },
  {
    name: 'libaom',
    version: '(as built into heic-to 1.6.5)',
    use: 'Decodes AV1 image data (AVIF). Included in heic-to.',
    licence: 'BSD 2-Clause License, with the Alliance for Open Media Patent License 1.0',
    licenceUrl: 'https://aomedia.org/license/software-license/',
    source: 'https://aomedia.googlesource.com/aom/',
    copyright: 'Copyright © Alliance for Open Media',
  },
];

export default function OpenSourcePage() {
  return (
    <LegalLayout title="Open-Source Licences">
      <p style={meta}>Last updated: {UPDATED}</p>

      <p>
        MyGala is built with open-source software, and we&rsquo;re grateful to the people who make it. Most of it is published under
        permissive licences such as MIT, ISC, BSD and Apache 2.0, whose copyright notices are kept with the code.
      </p>
      <p>
        A few libraries that run in your browser are published under the <strong>GNU Lesser General Public License (LGPL)</strong>.
        They&rsquo;re listed below with their licences and source code. MyGala uses them unmodified and loads them as a separate file,
        only when you upload a HEIC photo, so you can study, change or replace them under the terms of their licence.
      </p>

      <h2 style={h2}>Libraries in your browser</h2>
      {LIBRARIES.map((lib) => (
        <section key={lib.name} style={card}>
          <h3 style={h3}>
            {lib.name} <span style={{ fontWeight: 400, color: '#6B6470' }}>{lib.version}</span>
          </h3>
          <p style={{ margin: '0 0 10px' }}>{lib.use}</p>
          <ul style={ul}>
            <li>
              Licence: <a href={lib.licenceUrl} style={link} target="_blank" rel="noopener noreferrer">{lib.licence}</a>
            </li>
            <li>
              Source code: <a href={lib.source} style={link} target="_blank" rel="noopener noreferrer">{lib.source.replace(/^https:\/\//, '')}</a>
            </li>
            <li>{lib.copyright}</li>
          </ul>
        </section>
      ))}

      <h2 style={h2}>Licence texts</h2>
      <p>
        The LGPL v3.0 adds permissions to the GNU General Public License v3.0, so both apply:
      </p>
      <ul style={ul}>
        <li><a href={LGPL} style={link} target="_blank" rel="noopener noreferrer">GNU Lesser General Public License v3.0</a></li>
        <li><a href={GPL} style={link} target="_blank" rel="noopener noreferrer">GNU General Public License v3.0</a></li>
      </ul>

      <h2 style={h2}>Software on our servers</h2>
      <p>
        Our servers also use open-source software — for example sharp and libvips (LGPL v3.0 or later) to resize uploaded images.
        It runs only on our servers and isn&rsquo;t sent to your browser.
      </p>

      <h2 style={h2}>Questions</h2>
      <p>
        If you&rsquo;d like a copy of the source code for any library listed here, or have a question about how we use open-source
        software, email us at <a href={`mailto:${CONTACT_EMAIL}`} style={link}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalLayout>
  );
}

const h2: React.CSSProperties = {
  fontSize: 19,
  fontWeight: 700,
  color: '#241F2B',
  margin: '44px 0 12px',
};

const h3: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#241F2B',
  margin: '0 0 8px',
};

const ul: React.CSSProperties = {
  paddingLeft: 22,
  margin: '0 0 4px',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const meta: React.CSSProperties = {
  fontSize: 13,
  color: '#6B6470',
  marginBottom: 24,
};

const card: React.CSSProperties = {
  border: '1px solid #EDE8E3',
  borderRadius: 12,
  padding: '18px 20px',
  margin: '0 0 14px',
  background: '#fff',
};

const link: React.CSSProperties = { color: 'var(--rose)', overflowWrap: 'anywhere' };
