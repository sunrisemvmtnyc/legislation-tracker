import fetch from 'node-fetch';

export const URL_BASE = 'https://legislation.nysenate.gov/api/3';

export const legApi = (path, params = {}) => {
  // Add API key to all requests
  params.key = process.env.OPEN_LEGISLATION_KEY;
  // console.log("API URL to string", `${URL_BASE}${path}` + "?" + (new URLSearchParams(params)).toString())
  return `${URL_BASE}/${path}` + '?' + new URLSearchParams(params).toString();
};

const fetchAllPages = async (apiPath, firstResponseData) => {
  let allItems = firstResponseData.result.items;
  const totalPages = Math.ceil(firstResponseData.total / 1000);
  for (let i = 1; i < totalPages; i++) {
    let offsetStart = i * 1000 + 1;
    let nextResponse = await fetch(legApi(apiPath, { offset: offsetStart }));
    let nextResponseData = await nextResponse.json();
    allItems = allItems.concat(nextResponseData.result.items);
  }
  return allItems;
};

export const billsFromYear = async (year) => {
  // FIXME: legacy, delete
  // First request with no offset
  let firstResponse = await fetch(legApi(`bills/${year}`));
  let firstResponseData = await firstResponse.json();

  if (!firstResponseData.success) {
    throw 'Did not successfully retrieve bills from legislation.nysenate.gov. Response from API was marked as a failure.';
  }

  // Retrieve the remaining pages
  return fetchAllPages(`bills/${year}`, firstResponseData);
};

export const membersFromYear = async (year, limit, offset = 1) => {
  // Limit capped at 1000
  const MAX_LIMIT = 1000;
  limit = Math.min(limit, MAX_LIMIT);

  const url = legApi(`members/${year}`, {
    limit: limit,
    offset: offset,
  });
  let firstResponse = await fetch(url);
  let firstResponseData = await firstResponse.json();

  if (!firstResponseData.success) {
    console.log(url);
    throw 'Did not successfully retrieve members from legislation.nysenate.gov. Response from API was marked as a failure.';
  }

  return firstResponseData;
};
