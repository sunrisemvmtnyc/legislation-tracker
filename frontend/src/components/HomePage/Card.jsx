import PropTypes from 'prop-types';

import CategoryTag from '../Category/CategoryTag';
import { Box } from '@mui/material';
import { getSponsorMembers } from '../../utils';

/** Bill meta info snippet */
const SubInfo = ({ number, sponsors, status }) => (
  // todo: color
  <Box sx={{ color: '#6D6D6D' }}>
    <Box>Bill No.:&nbsp;&nbsp;&nbsp;{number}</Box>
    <Box>
      Sponsor{sponsors.length === 1 ? '' : 's'}:&nbsp;&nbsp;&nbsp;
      <strong>{sponsors.join(', ')}</strong>
    </Box>
    <Box>
      Status:&nbsp;&nbsp;&nbsp;<strong>{status}</strong>
    </Box>
  </Box>
);
SubInfo.propTypes = {
  number: PropTypes.string.isRequired,
  sponsors: PropTypes.arrayOf(PropTypes.string).isRequired,
  status: PropTypes.string.isRequired,
};

const Card = ({ bill, billCampaignMappings, allCampaigns }) => {
  let categories = [];
  if (billCampaignMappings && allCampaigns) {
    categories = billCampaignMappings
      .map((abrv) => allCampaigns[abrv])
      .filter((e) => e?.short_name || e?.long_name);
  }

  let sponsors = getSponsorMembers(bill);
  sponsors = [sponsors.sponsor.fullName].concat(
    sponsors.coSponsors.map((sponsor) => sponsor.fullName)
  );

  return (
    <a
      className="home-bill-card"
      href={`/bill/${bill.session}/${bill.printNo}`}
    >
      {!!categories.length && (
        <div className="home-bill-categories">
          {categories.map((category) => (
            <CategoryTag category={category} key={category.id} />
          ))}
        </div>
      )}
      <Box>{bill.title}</Box>
      <SubInfo
        number={bill.printNo}
        sponsors={sponsors}
        status={bill.status.statusDesc}
      />
    </a>
  );
};
Card.propTypes = {
  bill: PropTypes.object.isRequired,
  billCampaignMappings: PropTypes.arrayOf(PropTypes.string).isRequired,
  allCampaigns: PropTypes.object.isRequired,
};

export default Card;
