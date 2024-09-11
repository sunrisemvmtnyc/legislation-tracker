import PropTypes from 'prop-types';

const CellOption = {
  PASSED_ASSEMBLY: {
    className: 'member_bill-passed',
    contents: 'Passed assembly',
  },
  PASSED_SENATE: {
    className: 'member_bill-passed',
    contents: 'Passed senate',
  },
  NOT_SPONSORING: {
    className: 'member_bill-not_sponsoring',
    contents: 'Not sponsoring',
  },
  SPONSORING: { className: 'member_bill-sponsoring', contents: 'Sponsoring' },

  // fixme: handle option of dne: if sibling bill not provided
  DNE: { className: 'member_bill-dne', contents: "Not intro'd" },
};

/** Cell showing if member has sponsored a given bill */
const LegislatorRowCell = ({ memberId, bill, billSponsors }) => {
  const key = `${memberId}-sponsors-${bill.printNo}`;
  const isAssembly = bill.printNo.startsWith('A');
  let { className, contents } = CellOption.DNE;

  /** Bill that passes one chamber can get status like "in other chamber" */
  const hasPassed = (bill, isAssembly) => {
    if ((bill.status?.statusType || '').toLowerCase().includes('passed')) {
      return true;
    }
    for (const ms of bill?.milestones?.items || []) {
      if (ms?.statusType.toLowerCase() === 'passed_senate' && !isAssembly)
        return true;
      if (ms?.statusType.toLowerCase() === 'passed_assembly' && isAssembly)
        return true;
    }
    return false;
  };

  if (hasPassed(bill, isAssembly)) {
    if (isAssembly) ({ className, contents } = CellOption.PASSED_ASSEMBLY);
    else ({ className, contents } = CellOption.PASSED_SENATE);
  } else if (!billSponsors[bill.printNo])
    ({ className, contents } = CellOption.DNE);
  else if (billSponsors[bill.printNo].has(memberId))
    ({ className, contents } = CellOption.SPONSORING);
  else ({ className, contents } = CellOption.NOT_SPONSORING);

  return (
    <td key={key} className={className}>
      {contents}
    </td>
  );
};
LegislatorRowCell.propTypes = {
  memberId: PropTypes.number.isRequired,
  bill: PropTypes.object.isRequired,
  billSponsors: PropTypes.object.isRequired,
};

export const LegislatorRow = ({ member, bills, billSponsors }) => {
  return (
    <tr>
      <td>{member.districtCode}</td>
      <td>{member.fullName}</td>
      <td>fixme: all legislation pct</td>
      <td>fixme: climate legislation pct</td>
      {bills.map((bill) => (
        <LegislatorRowCell
          key={bill.printNo}
          memberId={member.memberId}
          bill={bill}
          billSponsors={billSponsors}
        />
      ))}
    </tr>
  );
};
LegislatorRow.propTypes = {
  member: PropTypes.object.isRequired,
  bills: PropTypes.array.isRequired,
  billSponsors: PropTypes.object.isRequired,
};
