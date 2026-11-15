// How long a page must stay offline (deactivated, deleted or paused) before an
// admin can purge it, and how many pages one purge run may delete.
export const OFFLINE_RETENTION_MONTHS = 3;
export const PURGE_BATCH_LIMIT = 50;

// Accounts whose email was never confirmed, with only unpublished drafts: an
// admin can move them to the trash this many days after sign-up, unless the
// owner opened their dashboard in the last UNCONFIRMED_RECENT_DAYS days.
export const UNCONFIRMED_AFTER_DAYS = 90;
export const UNCONFIRMED_RECENT_DAYS = 30;
