import fetch from 'node-fetch';

export const legAPIBase = "https://legislation.nysenate.gov/api/3"

// Format the URL with the key and given offset
export const legAPI = (path, offset = '0') => {
  const url =  `https://legislation.nysenate.gov/${path}?key=${process.env.OPEN_LEGISLATION_KEY}&offset=${offset}&limit=1000`;
  console.log(`using url: ${url}`)
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

/** Leverage ElasticSearch fuzzy search to try & get similar bills from other chamber */
export const getRelatedBills = async(year, chamber, summary) => {

  // HACK: use 1/4 number of words in a string as baseline for fuzzy search
  const summaryWc = summary.trim().split(/\s+/).length;
  const chamberFilter = {
    SENATE: "ASSEMBLY",
    ASSEMBLY: "SENATE",
  }[chamber.toUpperCase()];
  const url = `${legAPIBase}/bills/${year}/search?key=${process.env.OPEN_LEGISLATION_KEY}&term=summary:"${summary}"~${Math.floor(summaryWc / 4)}&AND&billType.chamber=${chamberFilter}`
  return (await (await fetch(url)).json()).result?.items || []
}