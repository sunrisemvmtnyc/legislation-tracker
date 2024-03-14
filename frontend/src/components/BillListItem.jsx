import React from 'react';
import PropTypes from 'prop-types';
import Icons from './icons.svg';
import CategoryTag from './Category/CategoryTag';

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "3fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr",
};

function stepCompleted(billData, step) {
  const completedSteps = {
    'IN_SENATE_COMM': ['In Committee'],
    'SENATE_FLOOR': ['In Committee', 'On Floor Calendar'],
    'PASSED_SENATE': ['In Committee', 'On Floor Calendar', 'Passed Senate'],

    'IN_ASSEMBLY_COMM': ['In Committee'],
    'ASSEMBLY_FLOOR': ['In Committee', 'On Floor Calendar'],
    'PASSED_ASSEMBLY': ['In Committee', 'On Floor Calendar', 'Passed Assembly'],

    'DELIVERED_TO_GOV': ['In Committee', 'On Floor Calendar', 'Passed Senate', 'Passed Assembly', 'Delivered to Governor'],
    'SIGNED_BY_GOV': ['In Committee', 'On Floor Calendar', 'Passed Senate', 'Passed Assembly', 'Delivered to Governor', 'Signed by Governor'],
    'VETOED': ['In Committee', 'On Floor Calendar', 'Passed Senate', 'Passed Assembly', 'Delivered to Governor', 'Vetoed'],
  }[billData.status.statusType] || [];

  return completedSteps.includes(step);
}

export default function BillListItem(props) {
  const billData = props.billData;

  // Derive categories based on keywords from billData
  // const billCategories = getCategories(billData);

  // Don't render anything if there is no data
  if (billData === null || billData === undefined) {
    return "";
  }

  // Prepare the full bill name
  let fullBillName;
  if (billData.billType.chamber === 'SENATE') {
    fullBillName = `Senate Bill ${billData.printNo}`;
  } else {
    fullBillName = `Assembly Bill ${billData.printNo}`;
  }

  const completed = (step) => stepCompleted(billData, step);

  return (
    <div style={rowStyle} className={billData.printNo}>
      {/* Render the CategoryTag component and pass the billCategories prop to it */}
      {/* <CategoryTag billCategories={billCategories} /> */}
      <div className="bill-description">
        <a href={`/bill/${billData.session}/${billData.printNo}`}><h2>{fullBillName}</h2></a>
        <p>{billData.title}</p>
      </div>
      <div className="overall-status passed">
        <p>
        {completed("Signed by Governor")
          ? `SIGNED: ${billData.status.actionDate}`
          : ""}
        </p>
      </div>
      <div className="introduced">
        <svg className="icon status__icon">
          <use xlinkHref={`${Icons}#icon--yes24`} />
        </svg>
      </div>
      <div className="in-committee">
        {completed("In Committee") && (
          <svg className="icon status__icon">
            <use xlinkHref={`${Icons}#icon--yes24`} />
          </svg>
        )}
      </div>
      <div className="on-floor">
        {completed("On Floor Calendar") && (
          <svg className="icon status__icon">
            <use xlinkHref={`${Icons}#icon--yes24`} />
          </svg>
        )}
      </div>
      <div className="pass-two">
        <div className="pass-senate">
          {completed("Passed Senate") ? (
            <svg className="icon status__icon">
              <use xlinkHref={`${Icons}#icon--yes24`} />
            </svg>) : (
            <svg className="icon status_icon">
              <use xlinkHref={`${Icons}#icon--blank24`} />
            </svg>
          )}
        </div>
        <div className="pass-assembly">
          {completed("Passed Assembly") ? (
            <svg className="icon status__icon">
              <use xlinkHref={`${Icons}#icon--yes24`} />
            </svg>) : (
            <svg className="icon status_icon">
              <use xlinkHref={`${Icons}#icon--blank24`} />
            </svg>
          )}
        </div>
      </div>
      <div className="deliver-gov">
        {completed("Delivered to Governor") && (
          <svg className="icon status__icon">
            <use xlinkHref={`${Icons}#icon--yes24`} />
          </svg>
        )}
      </div>
      <div className="sign-gov">
        {completed("Signed by Governor") && (
          <svg className="icon status__icon">
            <use xlinkHref={`${Icons}#icon--yes24`} />
          </svg>
        )}
      </div>
    </div>
  );
}
BillListItem.propTypes = {
  billData: PropTypes.object.isRequired
};