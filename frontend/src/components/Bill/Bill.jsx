import { PropTypes } from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LocForm from "./LocForm";
import './Bill.css';

function getSponsors(billData) { // TODO: change to getSponsors
  const {
    activeVersion,
    amendments: { items },
    sponsor,

  } = billData;
  return (
    1 +
    items[activeVersion].coSponsors.size +
    items[activeVersion].multiSponsors.size
  );
}

function getSponsorNumber(billData) {
  const {
    activeVersion,
    amendments: { items },
  } = billData;
  return (
    1 +
    items[activeVersion].coSponsors.size +
    items[activeVersion].multiSponsors.size
  );
}

function getSponsorNames(billData) {
  const {
    activeVersion,
    amendments: { items },
    sponsor,
  } = billData;
  return [sponsor.member.fullName, ...items[activeVersion].coSponsors.items.map (rep => rep.fullName)];
}

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

const BillCommitteeMembers = ({ committee, memberId, isSenate }) => {
  // TODO: better styling
  if (!isSenate) return <div>Assembly committees not currently supported</div>;
  if (!committee) return <div>No committee data</div>;
  console.log('committee');
  console.log(committee);
  const members = committee.committeeMembers.items.filter(
    (m) => m.memberId !== memberId
  );

  return (
    <div>
      <h4>Committee: {committee.name} </h4>
      <div>
        {members.map((member) => (
          <div key={member.memberId}>
            <span>
              {member.fullName}:{member.memberId}
            </span>
          </div>
        ))}
      </div>
      <div>
        <span>Total Committee Members: {members.length}</span>
      </div>
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
  const [placeName, setPlaceName] = useState("");

  const fetched = !!bill;
  const isSenate = bill?.billType?.chamber?.toLowerCase() === 'senate';

  // Fetch main bill data
  useEffect(() => {
    const fetchBill = async () => {
      const res = await fetch(`/api/v1/bills/${sessionYear}/${printNo}`);
      await setBill(await res.json());
    };
    fetchBill();
  }, []);

  // Fetch bill committee data
  useEffect(() => {
    if (!fetched || !isSenate) return;
    const chamber = bill.billType.chamber.toLowerCase();
    const committee = bill?.status?.committeeName;
    if (!committee) return;

    const fetchCommittee = async () => {
      const res = await fetch(
        `/api/v1/committees/${sessionYear}/${chamber}/${committee}`
      );
      setCommittee(await res.json());
    };

    fetchCommittee();
  }, [bill, sessionYear]);

  useEffect(() => {
    const setPlaceNameFromStorage = () => {
      setPlaceName(window.sessionStorage.getItem("placeName") || "[CITY, ZIP]");
    };
    setPlaceNameFromStorage();
    window.addEventListener('storage', setPlaceNameFromStorage);
    return () => {
      window.removeEventListener('storage', setPlaceNameFromStorage);
    }
  }, []);

  if (!bill)
    return (
      <div>
        <div>This is the bill {printNo}&apos;s page</div>
      </div>
    );

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
        <h2>{printNo}: {title}</h2>
        <p>{summary}</p>
        {/* <div className="category">
           <p>(Sample Category)</p>
        </div> */}
        
        <p>
          Introduced by <span style={{fontWeight:'bold'}}>{sponsorName}, District {bill.sponsor.member.districtCode}</span>
        </p>
        <p>Status: <span style={{fontWeight:'bold'}}>{bill.status.statusDesc}</span></p>
        <div><p>Total Sponsors: <span style={{fontWeight:'bold'}}>{getSponsorNumber(bill)}</span></p></div>
        <p><RelatedBills related={bill.billInfoRefs.items} /></p>
        {fetched && (
          <BillCommitteeMembers
            committee={committee}
            memberId={sponsorId}
            isSenate={isSenate}
          />
        )}
      </div>
      
      <div className="action">
        <h2>Take Action!</h2>
        <LocForm sponsorNames={getSponsorNames(bill)}/>
        <div className="script">
          <h2>Script when calling a Legislator</h2>
          <p>
            Hi, my name is [Your Name] and I'm a constituent from {window.sessionStorage.getItem('placeName')}. I'm calling to urge [Legislator's Name] to support {printNo}.
            <br></br>
            <br></br>
            IF LEAVING A VOICEMAIL: Be sure to state your full address so your call gets tallied!
          </p>
        </div>
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
  );
};
