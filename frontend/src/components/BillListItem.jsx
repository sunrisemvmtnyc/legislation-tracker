import React from 'react';
import Icons from './icons.svg';
import { BILL_STATUS, hasBillCompletedStep } from '../utils/billUtils';

// TODO move it to css file?
const rowStyle = {
  display: "grid",
  gridTemplateColumns: "3fr 1.5fr 1fr 1fr 1fr 1fr 1fr 1fr",
  borderBottom: "3px solid #000",
  margin: 0,
};

export default function BillListItem({ billData }) {

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

  const billURL = `https://www.nysenate.gov/legislation/bills/${billData.session}/${billData.printNo}`;

  const completed = (step) => hasBillCompletedStep(billData, step);

  return (
    <div style={rowStyle} className={billData.printNo}>
      <div className="bill-description">
        <a target="_blank" rel="noopener noreferrer" href={billURL}><h2>{fullBillName}</h2></a>
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
      <div className="two-lines">
        <div>
          {completed(BILL_STATUS.inSenateComm) && (
            <svg className="icon status__icon">
              <use xlinkHref={`${Icons}#icon--yes24`} />
            </svg>
          )}
        </div>
        <div>
          {completed(BILL_STATUS.inAssemblyComm) && (
            <svg className="icon status__icon">
              <use xlinkHref={`${Icons}#icon--yes24`} />
            </svg>
          )}
        </div>
      </div>
      <div className="two-lines">
        <div>
          {completed(BILL_STATUS.senateFloor) && (
            <svg className="icon status__icon">
              <use xlinkHref={`${Icons}#icon--yes24`} />
            </svg>
          )}
        </div>
        <div>
          {completed(BILL_STATUS.assemblyFloor) && (
            <svg className="icon status__icon">
              <use xlinkHref={`${Icons}#icon--yes24`} />
            </svg>
          )}
        </div>
      </div>
      <div className="two-lines">
        <div className="pass-senate">
          {completed(BILL_STATUS.passedSenate) ? (
            <svg className="icon status__icon">
              <use xlinkHref={`${Icons}#icon--yes24`} />
            </svg>) : (
            <svg className="icon status_icon">
              <use xlinkHref={`${Icons}#icon--blank24`} />
            </svg>
          )}
        </div>
        <div className="pass-assembly">
          {completed(BILL_STATUS.passedAssembly) ? (
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
        {completed(BILL_STATUS.delivered) && (
          <svg className="icon status__icon">
            <use xlinkHref={`${Icons}#icon--yes24`} />
          </svg>
        )}
      </div>
      <div className="sign-gov">
        {completed(BILL_STATUS.signed) && (
          <svg className="icon status__icon">
            <use xlinkHref={`${Icons}#icon--yes24`} />
          </svg>
        )}
      </div>
    </div>
  );
}
