export const BILL_STATUSES = [
  'Introduced',
  'In Senate Committee',
  'In Assembly Committee',
  'Senate Floor Calendar',
  'Assembly Floor Calendar',
  'Passed Senate',
  'Passed Assembly',
  'Delivered to Governor',
  'Signed By Governor',
  'Vetoed',
];

export const SEARCH_QUERY_KEY_MAP = {
  TEXT_SEARCH_KEY: '_', // for searching by text
  STATUS: 'status.statusDesc',
  SPONSOR_NAME: 'sponsor.member.fullName',
};

/** Page size for paginating members/bills */
export const REQUEST_PAGE_SIZE = 20;

export const SEARCH_DEBOUNCE_TIME = 300;
