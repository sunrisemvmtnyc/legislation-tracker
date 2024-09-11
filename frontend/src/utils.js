// https://github.com/nysenate/OpenLegislation/blob/dev/src/main/java/gov/nysenate/openleg/legislation/bill/BillStatusType.java#L11C1-L25C40
// Up-to-date 6/4/2024
// eslint-disable-next-line no-unused-vars
const ALL_STATUSES = new Set([
  'INTRODUCED',
  'IN_ASSEMBLY_COMM',
  'IN_SENATE_COMM',
  'ASSEMBLY_FLOOR',
  'SENATE_FLOOR',
  'PASSED_ASSEMBLY',
  'PASSED_SENATE',
  'DELIVERED_TO_GOV',
  'SIGNED_BY_GOV',
  'VETOED',
  'STRICKEN',
  'LOST',
  'SUBSTITUTED',
  'ADOPTED',
  'POCKET_APPROVAL',
]);

const IN_LEGISLATURE_STATUSES = new Set([
  'IN_SENATE_COMM',
  'IN_ASSEMBLY_COMM',
  'SENATE_FLOOR',
  'ASSEMBLY_FLOOR',
]);

const PASSED_LEGISLATURE_STATUSES = new Set([
  'PASSED_SENATE',
  'PASSED_ASSEMBLY',
  'DELIVERED_TO_GOV',
  'SIGNED_BY_GOV',
  'VETOED',
  'ADOPTED',
  'POCKET_APPROVAL',
]);

export const billIsAssembly = (bill) => bill?.basePrintNo?.startsWith('A');

/** Get sponsors for bills
 *
 * @param {Array} bills - Array of bill objects from legislative API
 * @returns {{
 *    sponsor: {
 *      memberId: number,
 *      chamber:	"ASSEMBLY" | "SENATE",
 *      incumbent: boolean,
 *      fullName: string,
 *      shortName: string,
 *      imgName: string,
 *      alternate:	boolean,
 *      sessionMemberId: number,
 *      sessionYear: number,
 *      districtCode: number,
 * }, coSponsors: Array<Object | undefined>
 * }} - Object with sponsor and co-sponsors
 */
export function getSponsorMembers(billsResult) {
  return {
    sponsor: billsResult?.sponsor?.member,
    coSponsors: billsResult?.coSponsors?.items,
  };
}

export const billInLegislature = (bill) =>
  IN_LEGISLATURE_STATUSES.has(bill?.status?.statusType);

export const billHasPassed = (bill) =>
  PASSED_LEGISLATURE_STATUSES.has(bill?.status?.statusType);
