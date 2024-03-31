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

export function createQueryStr(params) {
  return new URLSearchParams(params).toString();
}