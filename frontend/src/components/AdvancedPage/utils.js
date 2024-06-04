import { billInLegislature } from '../../utils';

export const billIsClimateBill = (bill, billCampaignMappings, campaigns) => {
  for (let campaignId of billCampaignMappings[bill.basePrintNo]) {
    const campaign = campaigns[campaignId];
    if (campaign.is_climate) return true;
  }
  return false;
};

/** Number of bills remaining in legislature, bucketed by assembly/senate and general/climate */
export const unpassedBillCounts = (
  senateBills,
  assemblyBills,
  billCampaignMappings,
  campaigns
) => {
  let unpassedAssemblyBillCount = 0;
  let unpassedAssemblyClimateBillCount = 0;
  let unpassedSenateBillCount = 0;
  let unpassedSenateClimateBillCount = 0;
  Object.values(assemblyBills).forEach((bill) => {
    if (billInLegislature(bill)) {
      unpassedAssemblyBillCount = ++unpassedAssemblyBillCount;
      if (billIsClimateBill(bill, billCampaignMappings, campaigns))
        unpassedAssemblyClimateBillCount = ++unpassedAssemblyClimateBillCount;
    }
  });
  Object.values(senateBills).forEach((bill) => {
    if (billInLegislature(bill)) {
      unpassedSenateBillCount = ++unpassedSenateBillCount;
      if (billIsClimateBill(bill, billCampaignMappings, campaigns))
        unpassedSenateClimateBillCount = ++unpassedSenateClimateBillCount;
    }
  });

  return {
    unpassedAssemblyBillCount,
    unpassedAssemblyClimateBillCount,
    unpassedSenateBillCount,
    unpassedSenateClimateBillCount,
  };
};

export const collectBillSponsors = (senateBills, assemblyBills) => {
  const billSponsors = {};
  Object.values(senateBills)
    .concat(Object.values(assemblyBills))
    .forEach((bill) => {
      let sponsorSet = new Set();

      // Use non-main sponsor first to fill Set more efficiently
      const amendmentItems = bill?.amendments?.items || {};
      Object.values(amendmentItems).forEach((amendmentItem) => {
        const cosponsors = amendmentItem.coSponsors?.items || [];

        // Create Set in bulk
        sponsorSet = new Set(cosponsors.map((cs) => cs.memberId));
      });

      const mainSponsor = bill?.sponsor?.member?.memberId;
      sponsorSet.add(mainSponsor);

      // todo: check if some use cosponsor instead of amendments
      // None seem to actually use the field

      billSponsors[bill.basePrintNo] = sponsorSet;
    });
  return billSponsors;
};

/** Combine bills with the corresponding one in the other chamber */
export const collectBillPairs = (senateBills, assemblyBills) => {
  const titles = Object.values(senateBills).map((bill) => bill.title);
  const senateByTitles = Object.fromEntries(
    Object.values(senateBills).map((bill) => [bill.title, bill])
  );
  const assemblyByTitles = Object.fromEntries(
    Object.values(assemblyBills).map((bill) => [bill.title, bill])
  );
  return titles.map((title) => [
    senateByTitles[title],
    assemblyByTitles[title],
  ]);
};
