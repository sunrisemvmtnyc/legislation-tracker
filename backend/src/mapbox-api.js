const URL_BASE = 'https://api.mapbox.com';

/** Construct URL to MapBox Geocoding API
 *
 * @param {string} path
 * @param {object} params
 */
export const mapBoxApi = (path, params = {}) => {
  // Add API key to all requests
  params.access_token = process.env.MAPBOX_KEY;
  params.country = params.country || 'US';
  params.fuzzyMatch = params.fuzzyMatch || true;

  // https://docs.mapbox.com/api/search/geocoding/

  return `${URL_BASE}/${path}?` + new URLSearchParams(params).toString();
};
