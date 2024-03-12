const URL_BASE = "https://v3.openstates.org";

/** Construct URL to OpenStates legislator/legislation API
 *
 * https://open.pluralpolicy.com/
 * Docs: https://docs.openstates.org/api-v3/
 *
 * @param {string} path
 * @param {object} params
 */
export const openStatesApi = (path, params = {}) => {

  // Add API key to all requests
  params.apikey = process.env.OPEN_STATES_KEY;

  // Note: currently we only support NY
  // Note: this is case-sensitive (some fields, eg name, are not case-sensitive)
  params.jurisdiction = "New York";
  params.page = params.page || 1;
  params.per_page = params.per_page || 10;

  return `${URL_BASE}/${path}?` + (new URLSearchParams(params)).toString();
}