import { notFound } from 'next/navigation';
import ThemeRenderer from '@/app/ui/themes/ThemeRenderer';
import { themeRegistry } from '@/app/ui/themes/registry';
import { THEME_DEMOS } from '@/app/ui/themes/demo-content';
import { START_NAME_MAX } from '@/app/lib/start-intent';

// A theme's sample page with the visitor's own event name and date, shown
// in the phone on the wedding "design your invitation" page
// (app/ui/style-previews.tsx). Framed by our own pages only (next.config.ts);
// nothing in it can be clicked.
export default async function ThemePreviewFrame({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ name?: string; date?: string }>;
}) {
  const { slug } = await params;
  const { name, date } = await searchParams;
  const demo = THEME_DEMOS[slug];
  if (!demo || !themeRegistry[slug]) notFound();
  const heading = typeof name === 'string' && name.trim() ? name.trim().slice(0, START_NAME_MAX) : demo.heading;
  const eventDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) ? date : demo.eventDate;
  // The sample schedule moves to their date.
  const eventProgram = demo.eventProgram?.map((p) => (eventDate && p.event_date === demo.eventDate ? { ...p, event_date: eventDate } : p));
  return (
    <>
      {/* No MyGala bar, nothing clickable, and no scrollbar (it still scrolls). */}
      <style>{'.mg-preview-topbar{display:none!important}a,button,input,select,textarea,label{pointer-events:none!important}html{scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}'}</style>
      <ThemeRenderer themeSlug={slug} {...demo} heading={heading} eventDate={eventDate} eventProgram={eventProgram} demo />
    </>
  );
}
