import { Icon } from '@iconify/react';
import { PropTypes } from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import LocForm from './LocForm';
import './Bill.css';
import CategoryTag from '../Category/CategoryTag';

/*
const getSponsorNumber = (billData) => {
  const {
    activeVersion,
    amendments: { items },
  } = billData;
  return (
    1 +
    items[activeVersion].coSponsors.size +
    items[activeVersion].multiSponsors.size
  );
};
*/

const getSponsorNames = (billData) => {
  const {
    activeVersion,
    amendments: { items },
    sponsor,
  } = billData;
  return [
    sponsor.member.fullName,
    ...items[activeVersion].coSponsors.items.map((rep) => rep.fullName),
  ];
};

const RelatedBills = ({ related }) => {
  if (!related) return <p className='related-bills'>No related bills</p>;
  return (
    <p className='related-bills'>
      <h4>Related Bills</h4>
      <ul>
        {Object.values(related).map((bill) => (
          <li key={bill.printNo}>
            <a href={`/bill/${bill.session}/${bill.printNo}`}>{bill.printNo}</a>:{' '}
            {bill.title}
          </li>
        ))}
      </ul>
    </p>
  );
};

RelatedBills.propTypes = {
  related: PropTypes.object.isRequired,
};

const BillCommitteeMembers = ({ committee, memberId, isSenate }) => {
  if (!isSenate || !committee) {
    return null;
  }

  const members = committee.committeeMembers.items.filter(
    (m) => m.memberId !== memberId
  );

  return (
    <p>
      <h4>Committee: {committee.name}</h4>
      <div>Total Committee Members: {members.length}</div>
      <ul>
        {members.map((member) => (
          <li key={member.memberId}>
            <b>{member.fullName}</b> - district {member.districtCode}
          </li>
        ))}
      </ul>
    </p>
  );
};

BillCommitteeMembers.propTypes = {
  committee: PropTypes.object.isRequired,
  memberId: PropTypes.string.isRequired,
  isSenate: PropTypes.bool.isRequired,
};

// Main Bill Component
export const Bill = () => {
  const { sessionYear, printNo } = useParams();
  const [bill, setBill] = useState();
  const [committee, setCommittee] = useState();
  const [placeName, setPlaceName] = useState('');
  const [atBill, setATBill] = useState('');
  const [campaign, setCampaign] = useState('');

  const fetched = !!bill;
  const campaigned = !!campaign;
  const important = !!atBill.importance;
  const isSenate = bill?.billType?.chamber?.toLowerCase() === 'senate';
  const senateSiteUrl = `https://www.nysenate.gov/legislation/bills/${sessionYear}/${printNo}`;

  // Fetch bill data
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
      const res = await fetch(
        `/api/v1/committees/${sessionYear}/${chamber}/${committeeName}`
      );
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

  // Retrieve Airtable info for Bill
  useEffect(() => {
    const fetchATBill = async () => {
      const res = await fetch(`/api/v1/bills/airtable-bills/${printNo}`);
      console.log(`/api/v1/bills/airtable-bills/${printNo}`);
      setATBill(await res.json());
    };
    fetchATBill();
  }, [printNo]);

  useEffect(() => {
    if (!atBill.campaign) return;
    const fetchCampaign = async () => {
      const res = await fetch(`/api/v1/campaigns/${atBill.campaign}`);
      setCampaign(await res.json());
    };
    fetchCampaign();
  }, [atBill]);

  if (!bill) {
    return <div>This is the bill {printNo}'s page</div>;
  }

  const {
    title,
    summary,
    sponsor: {
      member: { memberId: sponsorId, fullName: sponsorName },
    },
  } = bill;

  return (
    <div className="bill-content">
      <div className="summary">
        <h2>{title}</h2>
        <p>{summary}</p>
        <p>
          Bill No.: {printNo}
          <br />
          Sponsored by <strong>{sponsorName}</strong>
          <br />
          District {bill.sponsor.member.districtCode}
          <br />
          Status: <strong>{bill.status.statusDesc}</strong>
          <br />
        </p>
        <p>
          <a
            id="senate-site-link"
            href={senateSiteUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            See New York State Bill Page&nbsp;&nbsp;<Icon icon="material-symbols:open-in-new" />
          </a>
        </p>
        {/* <p>Total Sponsors: {getSponsorNumber(bill)}</p> */}


        {campaigned && (
          <CategoryTag
            category={{
              long_name: campaign.fields['Long Name'],
              short_name: campaign.fields['Short Name'],
              color: campaign.fields['Color'],
            }}
          />
        )}

        <RelatedBills related={bill.billInfoRefs.items} />
        {fetched && committee && (
          <BillCommitteeMembers
            committee={committee}
            memberId={String(sponsorId)}
            isSenate={isSenate}
          />
        )}
        <div className="important">
          <h4>Why this matters?</h4>
          <p>{important && atBill.importance}</p>
        </div>
      </div>

      <div className="action">
        <h1>Take action now</h1>
        <h2>Who are my representatives?</h2>

        <b>What can I do?</b>
        <p>Calling your local representatives is the most effective way to put pressure on those in power. If your representative does not sponsor the bill, call or write to them. You can use the script below to aid your call. </p>

        <LocForm sponsorNames={getSponsorNames(bill)} billNo={printNo} />
      </div>
    </div>
  );
};
