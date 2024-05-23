import { REQUEST_PAGE_SIZE } from './constants';

/** Fetches Airtable campaign mappings, assigns to state, and returns it */
export const fetchBillCampaignMappings = async (
  abortController,
  setCampaigns,
  setBillCampaignMappings
) => {
  const res = await fetch('/api/v1/bills/airtable-bills', {
    signal: abortController.signal,
  });
  const { bills: billCampaignMapping, campaigns } = await res.json();
  setCampaigns(campaigns);
  setBillCampaignMappings(billCampaignMapping);
  return billCampaignMapping;
};

/** Gets all the bills, PAGE_SIZE at a time. */
export const fetchBillsBlocks = async (
  abortController,
  billCampaignMapping,
  setSenateBills,
  setAssemblyBills
) => {
  const billIds = Object.keys(billCampaignMapping);

  const pages = [];
  for (let i = 0; i < billIds.length; i += REQUEST_PAGE_SIZE) {
    pages.push(billIds.slice(i, i + REQUEST_PAGE_SIZE));
  }

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const term = encodeURIComponent(`basePrintNo:(${page.join(' OR ')})`);
    const res = await (
      await fetch(`/api/v1/bills/2023/search?term=${term}`, {
        signal: abortController.signal,
      })
    ).json();

    (res.result?.items || []).forEach((item) => {
      const bill = item.result;
      const billId = bill.basePrintNo;
      if (billId.startsWith('S')) {
        setSenateBills((prev) => ({ ...prev, [billId]: bill }));
      }
      if (billId.startsWith('A')) {
        setAssemblyBills((prev) => ({ ...prev, [billId]: bill }));
      }
    });
  }
};
