import fetch from 'node-fetch';

export const URL_BASE = "https://legislation.nysenate.gov/api/3";

export const legApi = (path, params = {}) => {

  // Add API key to all requests
  params.key = process.env.OPEN_LEGISLATION_KEY;
  // console.log("API URL to string", `${URL_BASE}${path}` + "?" + (new URLSearchParams(params)).toString())
  return `${URL_BASE}/${path}` + "?" + (new URLSearchParams(params)).toString();

};

export const billsFromYear = async(year) => {
  // FIXME: legacy, delete
  // First request with no offset
  let firstResponse = await fetch(legApi(`bills/${year}`));
  let firstResponseData = await firstResponse.json();

  if (!firstResponseData.success) {
    throw('Did not successfully retrieve bills from legislation.nysenate.gov. Response from API was marked as a failure.');
  }

  // Retrieve the remaining pages
  let allBills = firstResponseData.result.items;
  const totalPages = Math.ceil(firstResponseData.total / 1000);
  for (let i = 1; i < totalPages; i++) {
    let offsetStart = (i * 1000) + 1;
    let nextResponse = await fetch(legApi(`bills/${year}`, {offset: offsetStart}));
    let nextResponseData = await nextResponse.json();
    allBills = allBills.concat(nextResponseData.result.items);
  }
  return allBills;
};
