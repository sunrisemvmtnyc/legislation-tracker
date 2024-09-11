import { getSponsorMembers } from "./utils";

const TEST_SPONSOR = {
  memberId: 555,
  chamber: "SENATE",
  incumbent: true,
  fullName: "sponsor",
  shortName: "SPONSOR",
  imgName: "sponsor.jpg",
  alternate: false,
  districtCode: 40,
  sessionMemberId: 555,
  sessionYear: 2023,
};

const TEST_CO_SPONSOR = {
  memberId: 555,
  chamber: "SENATE",
  incumbent: true,
  fullName: "cosponsor",
  shortName: "COSPONSOR",
  imgName: "cosponsor.jpg",
  alternate: false,
  districtCode: 36,
  sessionMemberId: 555,
  sessionYear: 2023,
};

describe("getSponsorMembers", () => {
  it("returns sponsor and co-sponsors from a bills response result", () => {
    const billsResponse = {
      success: true,
      message: "Data for bill S890-2023",
      responseType: "bill",
      result: {
        printNo: "S890",
        session: 2023,
        printNoStr: "S890-2023",
        sponsor: {
          member: TEST_SPONSOR,
          budget: false,
          rules: false,
          redistricting: false,
        },
        coSponsors: {
          items: [TEST_CO_SPONSOR],
          size: 1,
        },
      },
    };

    expect(getSponsorMembers(billsResponse.result)).toEqual({
      sponsor: TEST_SPONSOR,
      coSponsor: [TEST_CO_SPONSOR],
    });
  });
});
