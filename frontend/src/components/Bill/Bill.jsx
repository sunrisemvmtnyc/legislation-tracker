import { Icon } from '@iconify/react';
import { PropTypes } from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import LocForm from './LocForm';

const getSponsorNumber = (billData) => {
  const {
    activeVersion,
    amendments: { items },
   } = billData;
  return 1 + items[activeVersion].coSponsors.size + items[activeVersion].multiSponsors.size;
};

const getSponsorNames = (billData) => {
  const { activeVersion, amendments: { items }, sponsor } = billData;
  return [
    sponsor.member.fullName,
    ...items[activeVersion].coSponsors.items.map((rep) => rep.fullName),
  ];
};

const RelatedBills = ({ related }) => {
  if (!related) return <div>No related bills</div>;
  return (
    <div>
      <h4>Related Bills</h4>
      {Object.values(related).map((bill) => (
        <div key={bill.printNo}>
          <a href={`/bill/${bill.session}/${bill.printNo}`}>{bill.printNo}</a>:{' '}
          {bill.title}
        </div>
      ))}
    </div>
  );
};

RelatedBills.propTypes = {
  related: PropTypes.object.isRequired,
};

// BillCommitteeMembers Component
const BillCommitteeMembers = ({ committee, memberId, isSenate }) => {
  if (!isSenate) return <div>Assembly committees not currently supported</div>;
  if (!committee) return <div>No committee data</div>;

  const members = committee.committeeMembers.items.filter(
    (m) => m.memberId !== memberId
  );

  return (
    <div>
      <h4>Committee: {committee.name}</h4>
      <div>
        {members.map((member) => (
          <div key={member.memberId}>
            {member.fullName}: {member.memberId}
          </div>
        ))}
      </div>
      <div>
        <span>Total Committee Members: {members.length}</span></div>
    </div>
  );
};

BillCommitteeMembers.propTypes = {
  committee: PropTypes.object.isRequired,
  memberId: PropTypes.string.isRequired,
  isSenate: PropTypes.bool.isRequired,
};

export const Bill = () => {
  const { sessionYear, printNo } = useParams();
  const [bill, setBill] = useState();
  const [committee, setCommittee] = useState();
  const [placeName, setPlaceName] = useState('');

  const fetched = !!bill;
  const isSenate = bill?.billType?.chamber?.toLowerCase() === 'senate';
  const senateSiteUrl = `https://www.nysenate.gov/legislation/bills/${sessionYear}/${printNo}`;

  // Fetch main bill data
  useEffect(() => {
    const fetchBill = async () => {
      const res = await fetch(`/api/v1/bills/${sessionYear}/${printNo}`);
      setBill(await res.json());
    };
    fetchBill();
  }, [sessionYear, printNo]);

  // Fetch committee data
  useEffect(() => {
    if (!fetched || !isSenate) return;

    const chamber = bill.billType.chamber.toLowerCase();
    const committeeName = bill?.status?.committeeName;
    if (!committeeName) return;

    const fetchCommittee = async () => {
      const res = await fetch(`/api/v1/committees/${sessionYear}/${chamber}/${committeeName}`);
      setCommittee(await res.json());
    };
    fetchCommittee();
  }, [fetched, isSenate, bill, sessionYear]);

  // Retrieve place name from session storage
  useEffect(() => {
    const setPlaceNameFromStorage = () => {
      setPlaceName(window.sessionStorage.getItem('placeName') || '[CITY, ZIP]');
    };
    setPlaceNameFromStorage();
    window.addEventListener('storage', setPlaceNameFromStorage);

    return () => {
      window.removeEventListener('storage', setPlaceNameFromStorage);
    };
  }, []);

  if (!bill) {
    return <div>This is the bill {printNo}'s page</div>;
  }

  const {
    title,
    summary,
    sponsor: { member: { memberId: sponsorId, fullName: sponsorName } },
  } = bill;

  return (
    <div className="bill-content">
      <div className="summary">
        <h2>{title}</h2>
        <div>
          <a
            id="senate-site-link"
            href={senateSiteUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            on NYSenate site <Icon icon="material-symbols:open-in-new" />
          </a>
        </div>
        <p>{summary}</p>
        <div className="category">
          {bill.category} <p>(Sample Category)</p>
        </div>

        <p>
          Sponsored by <strong>{sponsorName}</strong>
          <br />
          District {bill.sponsor.member.districtCode}
        </p>
        <p>
          Status: <strong>{bill.status.statusDesc}</strong>
        </p>
        <p>Total Sponsors: {getSponsorNumber(bill)}</p>
        <RelatedBills related={bill.billInfoRefs.items} />
        {fetched && (
          <BillCommitteeMembers
            committee={committee}
            memberId={sponsorId}
            isSenate={isSenate}
          />
        )}
        <div className="important">
          <h4>Why is this important? Why should this bill pass?</h4>
          <p>
            Sample reasons why it should be passed!
            <ol>
              <li>Reason 1</li>
              <li>Just because</li>
            </ol>
          </p>
        </div>
      </div>

      <div className="action">
        <h2>Who are my representatives?</h2>
        <LocForm sponsorNames={getSponsorNames(bill)} billNo={printNo} />
      </div>
    </div>
  );
};
