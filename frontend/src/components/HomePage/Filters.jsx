import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { BILL_STATUSES, SEARCH_QUERY_KEY_MAP } from '../../constants';
import Dropdown from './Dropdown';
import './Filters.css';

const Filters = ({ campaignList, setSearchTerm, setCampaignFilter }) => {
  // creates ElasticSearch query string
  const [searchTermsObj, setSearchTermsObj] = useState({});

  // update search term when obj updatedj
  useEffect(() => {
    const searchTermStr = Object.entries(searchTermsObj)
      // check if value part of object entry is truthy
      .filter((entry) => entry[1].length)
      .map(
        ([key, val]) => `${key}:(${val.map((val) => `"${val}"`).join(' OR ')})`
      )
      .join(' AND ');
    setSearchTerm(encodeURIComponent(searchTermStr) || '*');
  }, [setSearchTerm, searchTermsObj]);

  const createSearchTermsObjUpdater = useCallback(
    (searchKey) => {
      return (searchVal) => {
        setSearchTermsObj((currObj) => ({
          ...currObj,
          [searchKey]: searchVal?.length ? searchVal : [],
        }));
      };
    },
    [setSearchTermsObj]
  );

  const updateLegislatorFilter = createSearchTermsObjUpdater(
    SEARCH_QUERY_KEY_MAP.SPONSOR_NAME
  );
  const updateStatusFilter = createSearchTermsObjUpdater(
    SEARCH_QUERY_KEY_MAP.STATUS
  );

  return (
    <div className="filters-bar">
      <Dropdown
        id="legislator-select"
        label="Legislator Name"
        // TODO: populate with actual legislator names
        options={[
          {
            displayName: 'Pete Harckham',
            value: 'Pete Harckham',
          },
          {
            displayName: 'Edward Ra',
            value: 'Edward Ra',
          },
        ]}
        updateFilter={updateLegislatorFilter}
      />
      <Dropdown
        id="status-select"
        label="Bill Status"
        options={BILL_STATUSES.map((status) => ({
          displayName: status,
          value: status,
        }))}
        updateFilter={updateStatusFilter}
      />
      <Dropdown
        id="category-select"
        label="Bill Category"
        options={campaignList.map((campaign) => ({
          displayName: campaign.short_name,
          value: campaign.id,
        }))}
        updateFilter={setCampaignFilter}
      />
    </div>
  );
};

Filters.propTypes = {
  campaignList: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCampaignFilter: PropTypes.func.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
};

export default Filters;
