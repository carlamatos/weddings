import { fetchPageSettings, fetchPotluckEntries } from '@/app/lib/data';
import { requireOwnedPage } from '@/app/lib/dashboard';
import { arePotluckEntriesPublic, isPotluckOn } from '@/app/lib/potluck';
import { SectionToggle } from '@/app/ui/dashboard/section-toggle';
import { PlusUpgradePrompt } from '@/app/ui/dashboard/plus-upgrade-prompt';
import { PotluckEntries } from '@/app/ui/dashboard/potluck-entries';

export default async function PotluckPage({ params }: { params: Promise<{ pageId: string }> }) {
  const userPage = await requireOwnedPage(params);
  const pageId = Number(userPage.id);

  if (userPage.plan_type !== 'paid') {
    return (
      <PlusUpgradePrompt
        page={userPage}
        title="Potluck"
        pitch="The Potluck section is a Plus feature. Upgrade to let guests sign up for what they're bringing, so you don't end up with ten desserts."
      />
    );
  }

  const [settings, entries] = await Promise.all([fetchPageSettings(pageId), fetchPotluckEntries(pageId)]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#241F2B', margin: '0 0 6px' }}>Potluck</h1>
        <p style={{ fontSize: 14, color: '#6B6470', margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
          Guests tell you what they&rsquo;re bringing with their name and email. If a guest sends the form again with the same email,
          their entry is updated. The section appears on your page right after the RSVP.
        </p>
      </div>

      <SectionToggle pageId={pageId} settingName="show_potluck" initialOn={isPotluckOn(settings)} />
      <SectionToggle
        pageId={pageId}
        settingName="show_potluck_entries"
        initialOn={arePotluckEntriesPublic(settings)}
        label="Show everyone’s entries on your page"
      />
      <p style={{ fontSize: 13, color: '#6B6470', margin: '-12px 0 24px', maxWidth: 640, lineHeight: 1.6 }}>
        When this is off, only you can see the entries, here. When it&rsquo;s on, guests see a list of what others are bringing —
        first name and last initial only, never email addresses.
      </p>

      <PotluckEntries pageId={pageId} initialEntries={entries} />
    </div>
  );
}
