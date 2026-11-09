import { rsvpPlan, type RsvpStep } from './marketing/rsvp-deadline';
import type { RsvpTimelinePlan } from './saved-plans';

// The saved RSVP timeline's steps, each with the dashboard screen where
// it's done. Shared by the Timeline screen and the reminder emails.
export const STEP_SCREENS: Record<string, { section: string; label: string }> = {
  save: { section: '/invitations', label: 'Send save-the-dates' },
  invite: { section: '/invitations', label: 'Send your invitations' },
  reminder: { section: '/reminders', label: 'Set up reminder emails' },
  deadline: { section: '/rsvp', label: 'See who’s replied' },
  chase: { section: '/rsvp', label: 'See who hasn’t replied' },
  seating: { section: '/seating', label: 'Seat your guests' },
  final: { section: '/rsvp', label: 'Get your final numbers' },
};

export function timelineSteps(plan: RsvpTimelinePlan): { deadline: string; steps: RsvpStep[] } {
  return rsvpPlan(plan.eventDate, plan.type, plan.finalCountDays, plan.seating);
}
