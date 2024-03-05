import { useMemo } from 'react';
import { FormGroup } from '@mui/material';

import { TAGS, BILL_STATUSES } from '../../constants';
import Dropdown from './Dropdown';
import './Filters.css';

const stringToOptionShape = string => ({
  displayName: string,
  value: string,
});

const Filters = ({ bills }) => {
  const sponsors = useMemo(() => {
    const seenSponsors = {};
    const sponsorDataList = [];

    bills.forEach((bill) => {
      const displayName = bill.sponsor.member?.fullName;
      const value = bill.sponsor.member?.memberId;

      if (!displayName || seenSponsors[displayName]) return;

      sponsorDataList.push({
        displayName,
        value,
      });

      seenSponsors[displayName] = true;
    });

    // alphabetize sponsors
    return sponsorDataList.sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    );
  }, [bills]);

  return (
    <FormGroup className="filters-bar" fullWidth>
      <Dropdown
        id="legislator-select"
        label="Legislator Name"
        options={sponsors}
      />
      <Dropdown
        id="status-select"
        label="Bill Status"
        options={Object.values(BILL_STATUSES).map(stringToOptionShape)}
      />
      <Dropdown
        id="category-select"
        label="Bill Category"
        options={TAGS.map(stringToOptionShape)}
      />
    </FormGroup>
  );
};

export default Filters;
