import { REQUEST_PAGE_SIZE } from './constants';

/** Creates ElasticSearch query string */
const evalSearchTerm = (searchTermsObj) => {
  let searchTermStr = Object.entries(searchTermsObj)
    // check if value part of object entry is truthy
    .filter((entry) => entry[1].length)
    .map(
      ([key, val]) => `${key}:(${val.map((val) => `"${val}"`).join(' OR ')})`
    )
    .join(' AND ');
  searchTermStr = encodeURIComponent(searchTermStr);
  return searchTermStr || '*';
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
  searchObj,
  setBills
) => {
  let done = false;
  const searchTerm = evalSearchTerm(searchObj);

  const url = '/api/v1/bills/2023/search';
  const urlParams = {
    term: searchTerm,
    limit: REQUEST_PAGE_SIZE,
    offset: 1,
  };

  while (!done) {
    const res = await (
      await fetch(`${url}?${new URLSearchParams(urlParams).toString()}`, {
        signal: abortController.signal,
      })
    ).json();

    urlParams.offset = res.offsetEnd + 1;
    if (res.offsetEnd >= res.total) done = true;

    // Update bills using callback
    setBills((res.result?.items || []).map((item) => item.result));
  }
};
