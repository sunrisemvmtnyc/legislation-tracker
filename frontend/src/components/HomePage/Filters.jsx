import { useCallback } from 'react';
import PropTypes from 'prop-types';

import { BILL_STATUSES, SEARCH_QUERY_KEY_MAP } from '../../constants';
import Dropdown from './Dropdown';
import TextSearch from './TextSearch';
import loadingSvg from '../../assets/loading.svg';
import './Filters.css';

const Filters = ({
  sponsorList,
  campaignList,
  setSearchTermsObj,
  setCampaignFilter,
  setLegislatorFilter,
  isFetching,
}) => {
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
        options={sponsorList}
        updateFilter={setLegislatorFilter}
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
      {isFetching && (
        <img
          className="loading__icon"
          src={loadingSvg}
          alt="Loading indicator"
        />
      )}
    </div>
  );
};

Filters.propTypes = {
  campaignList: PropTypes.arrayOf(PropTypes.object).isRequired,
  sponsorList: PropTypes.arrayOf(PropTypes.object).isRequired,
  setCampaignFilter: PropTypes.func.isRequired,
  setSearchTermsObj: PropTypes.func.isRequired,
  setLegislatorFilter: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
};

export default Filters;
