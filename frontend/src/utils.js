export function getSponsorMembers(billsResult) {
  const {
    sponsor: { member: sponsorMember },
    coSponsors: { items: coSponsorMembers },
  } = billsResult;

  return {
    sponsor: sponsorMember,
    coSponsors: coSponsorMembers,
  };
}
