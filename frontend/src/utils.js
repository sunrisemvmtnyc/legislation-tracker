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
