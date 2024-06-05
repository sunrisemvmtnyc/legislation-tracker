/** Page size for paginating members/bills */
const PAGE_SIZE = 20;

export const fetchLegislators = async (
  abortController,
  setAssemblyMembers,
  setSenators
) => {
  let total = 1000; // Arbitrary - will be overwritten on first fetch
  let page = 0;
  const params = (page) =>
    new URLSearchParams({
      limit: PAGE_SIZE,
      offset: 1 + page * PAGE_SIZE,
      full: true,
    });

  while (total > 1 + page * PAGE_SIZE) {
    const res = await (
      await fetch(`/api/v1/members/2023?${params(page)}`, {
        signal: abortController.signal,
      })
    ).json();
    const members = res?.result?.items || [];
    const senators = members.filter(
      (m) => m.chamber.toLowerCase() === 'senate'
    );
    const assemblyMembers = members.filter(
      (m) => m.chamber.toLowerCase() === 'assembly'
    );
    setSenators((prev) => [...prev, ...senators]);
    setAssemblyMembers((prev) => [...prev, ...assemblyMembers]);

    total = res?.total || 0;
    page++;
  }
};

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
  for (let i = 0; i < billIds.length; i += PAGE_SIZE) {
    pages.push(billIds.slice(i, i + PAGE_SIZE));
  }

  // useful for debugging
  // for (let i = 0; i < 1; i++) {
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // We directly fetch each bill individually. Can't use search API bc it doesn't return enough fields
    const promises = page.map((billId) =>
      fetch(`/api/v1/bills/2023/${billId}?view=info`, {
        signal: abortController.signal,
      })
    );

    const res = await Promise.all(promises);
    const bills = await Promise.all(res.map((r) => r.json()));

    const senateBills = Object.fromEntries(
      bills
        .filter((bill) => bill.basePrintNo.startsWith('S'))
        .map((bill) => [bill.basePrintNo, bill])
    );
    const assemblyBills = Object.fromEntries(
      bills
        .filter((bill) => bill.basePrintNo.startsWith('A'))
        .map((bill) => [bill.basePrintNo, bill])
    );

    setSenateBills((prev) => ({ ...prev, ...senateBills }));
    setAssemblyBills((prev) => ({ ...prev, ...assemblyBills }));
  }
};
