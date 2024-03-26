import { PropTypes } from 'prop-types';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
    <div>
      <div>This is the bill {printNo}&apos;s page</div>
      <h2>{title}</h2>
      <p>{summary}</p>
      <div>
        <span>
          {sponsorName}:{sponsorId}
        </span>
      </div>
      <div>
        <span>Total Sponsors: {getSponsorNumber(bill)}</span>
      </div>
      <RelatedBills related={bill.billInfoRefs.items} />
      {fetched && (
        <BillCommitteeMembers
          committee={committee}
          memberId={sponsorId}
          isSenate={isSenate}
        />
      )}
    </div>
  );
};
