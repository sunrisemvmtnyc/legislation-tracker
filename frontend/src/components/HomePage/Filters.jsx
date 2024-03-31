import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { TAGS, BILL_STATUSES, SEARCH_QUERY_KEY_MAP } from "../../constants";
import Dropdown from "./Dropdown";
import "./Filters.css";

const Filters = ({ setSearchTerm }) => {   // creates ElasticSearch query string
  const [searchTermsObj, setSearchTermsObj] = useState({}); 

  // update search term when obj updatedj
  useEffect(() => {
    const searchTermStr = Object.entries(searchTermsObj)
      .map(([key, val]) => `${key}:${val}`)
      .join(' AND ');
    setSearchTerm(searchTermStr);
  }, [setSearchTerm, searchTermsObj]);

  const createSearchTermsObjUpdater = useCallback(searchKey => {
    return (searchVal) => {
      setSearchTermsObj(currObj => ({
        ...currObj,
        [searchKey]: searchVal,
      }));
    };
  }, [setSearchTermsObj]);

  const updateLegislatorFilter = createSearchTermsObjUpdater(SEARCH_QUERY_KEY_MAP.SPONSOR_NAME);
  const updateStatusFilter = createSearchTermsObjUpdater(SEARCH_QUERY_KEY_MAP.STATUS);

  return (
    <div className="filters-bar">
      <Dropdown
        id="legislator-select"
        label="Legislator Name"
        options={[
          {
            displayName: "Pete Harckham",
            value: "Pete Harckham",
          },
          {
            displayName: "Edward Ra",
            value: "Edward Ra",
          }
        ]}
        updateFilter={updateLegislatorFilter}
      />
      <Dropdown
        id="status-select"
        label="Bill Status"
        options={Object.entries(BILL_STATUSES).map(([key, val]) => ({
          displayName: val,
          value: key,
        }))}
        updateFilter={updateStatusFilter}
      />
      <Dropdown
        id="category-select"
        label="Bill Category"
        options={TAGS.map(tag => ({
          displayName: tag,
          value: tag,
        }))}
      />
    </div>
  );
};

Filters.propTypes = {
  setSearchTerm: PropTypes.func,
};

export default Filters;
