import { greatVibes } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <span className={greatVibes.className} style={{ fontSize: '36px', color: '#241F2B', letterSpacing: '0.5px', lineHeight: 1 }}>
      My<span style={{ color: '#B6584A' }}>Gala</span>
    </span>
  );
}
