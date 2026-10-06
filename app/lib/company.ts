// The legal owner and operator of mygala.ca. Used by the legal pages, the
// site footer and email footers, so the company is named the same way
// everywhere. Fill in the empty fields to publish them; anything left empty
// is simply not shown.

export type Company = {
  legalName: string;
  tradeName: string;
  website: string;
  email: string;
  incorporatedUnder: string;
  address: string[];
  phone: string;
  corporationNumber: string;
  privacyOfficer: string;
};

export const COMPANY: Company = {
  legalName: 'MYGALA INC.',
  tradeName: 'MyGala',
  website: 'mygala.ca',
  email: 'info@mygala.ca',
  // e.g. 'the Canada Business Corporations Act' or 'the Business Corporations Act (British Columbia)'
  incorporatedUnder: 'the Canada Business Corporations Act',
  // Registered office / business address, one line per array item.
  // iPostal1 mailbox: unit 115 is iPostal1's location, #1048 is MyGala's box.
  address: ['1975 McCallum Road, Unit 115 #1048', 'Abbotsford, BC V2S 3N3', 'Canada'],
  // Customer phone number, e.g. '+1 604 555 0100'.
  phone: '+1 778-822-3685',
  // Corporation number and/or CRA business number, if you want them shown.
  corporationNumber: '',
  // The person (or title) accountable for privacy under PIPEDA.
  privacyOfficer: 'Privacy Officer',
};

export const COPYRIGHT_YEAR_START = 2026;

export function copyrightLine(year = new Date().getFullYear()): string {
  const years = year > COPYRIGHT_YEAR_START ? `${COPYRIGHT_YEAR_START}–${year}` : `${COPYRIGHT_YEAR_START}`;
  return `© ${years} ${COMPANY.legalName} All rights reserved.`;
}

// One line for email footers: "MYGALA INC. · 123 Main St, Vancouver, BC · mygala.ca"
export function companyMailingLine(): string {
  return [COMPANY.legalName, COMPANY.address.join(', '), COMPANY.website].filter(Boolean).join(' · ');
}
