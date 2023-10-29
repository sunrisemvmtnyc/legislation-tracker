import fetch from 'node-fetch';

export const legAPIBase = "https://legislation.nysenate.gov/api/3"
export const legAPIURL = (path, params = {}) => {
  params.key = process.env.OPEN_LEGISLATION_KEY;
  console.log("legapiurl to string", `${legAPIBase}${path}` + "?" + (new URLSearchParams(params)).toString())
  return `${legAPIBase}${path}` + "?" + (new URLSearchParams(params)).toString()

}

// Format the URL with the key and given offset
export const legAPI = (path, offset = '0') => {
  const url =  `https://legislation.nysenate.gov/${path}?key=${process.env.OPEN_LEGISLATION_KEY}&offset=${offset}&limit=1000`;
  return url
}

export const requestBillsFromAPI = async(year) => {
  // First request with no offset
  let firstResponse = await fetch(legAPI(`api/3/bills/${year}`));
  let firstResponseData = await firstResponse.json();

  if (!firstResponseData.success) {
    throw('Did not successfully retrieve bills from legislation.nysenate.gov. Response from API was marked as a failure.');
  }

  // Retrieve the remaining pages
  let allBills = firstResponseData.result.items;
  const totalPages = Math.ceil(firstResponseData.total / 1000);
  for (let i = 1; i < totalPages; i++) {
    let offsetStart = (i * 1000) + 1;
    let nextResponse = await fetch(legAPI(`/api/3/bills/${year}`, offsetStart));
    let nextResponseData = await nextResponse.json();
    allBills = allBills.concat(nextResponseData.result.items);
  }
  return allBills;
};

export const getBill = async(year, printNumber) => {
  return (await (await fetch(legAPI(`api/3/bills/${year}/${printNumber}`))).json()).result
}
