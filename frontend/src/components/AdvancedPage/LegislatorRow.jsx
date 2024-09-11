import PropTypes from 'prop-types';

import { billIsClimateBill } from './utils';

import { billHasPassed, billIsAssembly } from '../../utils';

const CellOption = {
  PASSED_ASSEMBLY: {
    className: 'member_bill-passed',
    contents: '--',
  },
  PASSED_SENATE: {
    className: 'member_bill-passed',
    contents: '--',
  },
  NOT_SPONSORING: {
    className: 'member_bill-not_sponsoring',
    contents: 'no',
  },
  SPONSORING: { className: 'member_bill-sponsoring', contents: 'yes' },

  // fixme: handle option of dne: if sibling bill not provided
  DNE: { className: 'member_bill-dne', contents: '--' },
};

/** Cell showing if member has sponsored a given bill */
const LegislatorRowCell = ({ memberId, bill, billSponsors }) => {
  const isAssembly = billIsAssembly(bill);
  const hasPassed = billHasPassed(bill);
  let { className, contents } = CellOption.DNE;

  if (!bill) ({ className, contents } = CellOption.DNE);
  else if (hasPassed) {
    if (isAssembly) ({ className, contents } = CellOption.PASSED_ASSEMBLY);
    else ({ className, contents } = CellOption.PASSED_SENATE);
  } else if (!billSponsors[bill.basePrintNo])
    ({ className, contents } = CellOption.DNE);
  else if (billSponsors[bill.basePrintNo].has(memberId))
    ({ className, contents } = CellOption.SPONSORING);
  else ({ className, contents } = CellOption.NOT_SPONSORING);

  return <td className={className}>{contents}</td>;
};
LegislatorRowCell.propTypes = {
  memberId: PropTypes.number.isRequired,
  bill: PropTypes.object,
  billSponsors: PropTypes.object.isRequired,
};

export const LegislatorRow = ({
  member,
  bills,
  filteredBills,
  billSponsors,
  unpassedBillCount,
  unpassedClimateBillCount,
  billCampaignMappings,
  campaigns,
}) => {
  const memberId = member.memberId;

  let sponsoredBillsCount = 0;
  let sponsoredClimateBillsCount = 0;
  bills.forEach((bill) => {
    if (!bill) return;
    if (billSponsors[bill.basePrintNo].has(memberId)) {
      ++sponsoredBillsCount;
      if (billIsClimateBill(bill, billCampaignMappings, campaigns))
        ++sponsoredClimateBillsCount;
    }
  });
  const allLegPct = ((sponsoredBillsCount * 100) / unpassedBillCount).toFixed(
    0
  );
  const climateLegPct = (
    (sponsoredClimateBillsCount * 100) /
    unpassedClimateBillCount
  ).toFixed(0);

  return (
    <tr>
      <td className="row-name">{member.fullName}</td>
      <td
        style={{
          background: `rgb(${100 - allLegPct}% ${allLegPct}% 0% / 60%)`,
        }}
      >
        {allLegPct}%
      </td>
      <td
        style={{
          background: `rgb(${100 - climateLegPct}% ${climateLegPct}% 0% / 60%)`,
        }}
      >
        {climateLegPct}%
      </td>
      {filteredBills.map((bill, i) => (
        <LegislatorRowCell
          memberId={memberId}
          // TODO: Not great to key by index
          key={`${memberId}-sponsors-${bill?.basePrintNo || 'no-bill-' + i}`}
          bill={bill}
          billSponsors={billSponsors}
        />
      ))}
    </tr>
  );
};
LegislatorRow.propTypes = {
  member: PropTypes.object.isRequired,
  bills: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.undefined])
  ).isRequired,
  filteredBills: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.undefined])
  ).isRequired,
  billSponsors: PropTypes.object.isRequired,
  unpassedBillCount: PropTypes.number.isRequired,
  unpassedClimateBillCount: PropTypes.number.isRequired,
  billCampaignMappings: PropTypes.object.isRequired,
  campaigns: PropTypes.object.isRequired,
};
