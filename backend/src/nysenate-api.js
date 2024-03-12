const URL_BASE = "https://legislation.nysenate.gov/api/3";

/** Construct URL to NY Open Legislation API
 *
 * Docs: https://legislation.nysenate.gov/static/docs/html/bills.html
 */
export const legApi = (path, params = {}) => {

  // Add API key to all requests
  params.key = process.env.OPEN_LEGISLATION_KEY;
  // console.log("API URL to string", `${URL_BASE}${path}` + "?" + (new URLSearchParams(params)).toString())
  return `${URL_BASE}/${path}` + "?" + (new URLSearchParams(params)).toString();

};
