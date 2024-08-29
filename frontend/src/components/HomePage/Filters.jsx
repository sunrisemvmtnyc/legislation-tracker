import { useCallback } from 'react';
import PropTypes from 'prop-types';

import { BILL_STATUSES, SEARCH_QUERY_KEY_MAP } from '../../constants';
import Dropdown from './Dropdown';
import TextSearch from './TextSearch';
import './Filters.css';

const Filters = ({ campaignList, setSearchTermsObj, setCampaignFilter }) => {
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
  const updateTextSearchFilter = createSearchTermsObjUpdater(
    SEARCH_QUERY_KEY_MAP.TEXT_SEARCH_KEY
  );

  return (
    <div className="filters-bar">
      <TextSearch updateValue={updateTextSearchFilter} />
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
  setSearchTermsObj: PropTypes.func.isRequired,
};

export default Filters;
