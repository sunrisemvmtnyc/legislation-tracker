export const billIsClimateBill = (bill, billCampaignMappings, campaigns) => {
  for (let campaignId of billCampaignMappings[bill.basePrintNo]) {
    const campaign = campaigns[campaignId];
    if (campaign.is_climate) return true;
  }
  return false;
};
