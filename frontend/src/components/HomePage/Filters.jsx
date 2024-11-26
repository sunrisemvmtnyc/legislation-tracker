import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

import { BILL_STATUSES } from '../../constants';
import Dropdown from './Dropdown';
import TextSearch from './TextSearch';

import loadingSvg from '../../assets/loading.svg';
import './Filters.css';

/** To match MUI select colors
 *
 * There's probably a better way to do this, but ¯\_(ツ)_/¯ for now
 * Could make a new color palette: https://v5.mui.com/material-ui/customization/palette
 */
const ColorButton = styled(Button)(() => ({
  color: 'rgba(0, 0, 0, 0.6)',
  fontFamily: `"Fjalla One", "Roboto", "Helvetica", "Arial", sans-serif`,
  fontSize: '1em',
  backgroundColor: 'white',
  borderColor: 'rgba(0, 0, 0, 0.23)',
  '&:hover': {
    borderColor: 'rgba(0, 0, 0, 0.87)',
    backgroundColor: 'white',
  },
}));

const Filters = ({
  sponsorList,
  campaignList,
  campaignFilter,
  setCampaignFilter,
  searchString,
  setSearchString,
  statusFilter,
  setStatusFilter,
  legislatorFilter,
  setLegislatorFilter,
  isFetching,
}) => {
  const clear = () => {
    setSearchString('');
    setCampaignFilter([]);
    setLegislatorFilter([]);
    setStatusFilter([]);
  };

  return (
    <div className="filters-bar">
      <TextSearch value={searchString} updateValue={setSearchString} />
      <Dropdown
        id="legislator-select"
        label="Legislator Name"
        options={sponsorList}
        updateFilter={setLegislatorFilter}
        value={legislatorFilter}
      />
      <Dropdown
        id="status-select"
        label="Bill Status"
        options={BILL_STATUSES.map((status) => ({
          displayName: status,
          value: status,
        }))}
        value={statusFilter}
        updateFilter={setStatusFilter}
      />
      <Dropdown
        id="category-select"
        label="Bill Category"
        options={campaignList.map((campaign) => ({
          displayName: campaign.short_name,
          value: campaign.id,
        }))}
        value={campaignFilter}
        updateFilter={setCampaignFilter}
      />
      <ColorButton
        variant="outlined"
        sx={{ whiteSpace: 'nowrap' }}
        onClick={clear}
      >
        CLEAR ALL
      </ColorButton>
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
  sponsorList: PropTypes.arrayOf(PropTypes.object).isRequired,
  searchString: PropTypes.string.isRequired,
  setSearchString: PropTypes.func.isRequired,
  campaignList: PropTypes.arrayOf(PropTypes.object).isRequired,
  campaignFilter: PropTypes.arrayOf(PropTypes.string).isRequired,
  setCampaignFilter: PropTypes.func.isRequired,
  legislatorFilter: PropTypes.arrayOf(PropTypes.string).isRequired,
  setLegislatorFilter: PropTypes.func.isRequired,
  statusFilter: PropTypes.arrayOf(PropTypes.string).isRequired,
  setStatusFilter: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
};

export default Filters;
