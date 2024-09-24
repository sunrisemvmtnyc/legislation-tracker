import PropTypes from 'prop-types';

import CategoryTag from '../Category/CategoryTag';

const Card = ({ bill, billCampaignMappings, allCampaigns }) => {
  let categories = [];
  if (billCampaignMappings && allCampaigns) {
    categories = billCampaignMappings
      .map((abrv) => allCampaigns[abrv])
      .filter(Boolean);
  }
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
      <div>{bill.title}</div>
      {!!bill.status.statusDesc && (
        <div>
          {' '}
          Status: <b>{bill.status.statusDesc}</b>
        </div>
      )}
    </a>
  );
};
Card.propTypes = {
  bill: PropTypes.object.isRequired,
  billCampaignMappings: PropTypes.arrayOf(PropTypes.string).isRequired,
  allCampaigns: PropTypes.object.isRequired,
};

export default Card;
