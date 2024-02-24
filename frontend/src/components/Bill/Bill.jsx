import { PropTypes } from "prop-types";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from ".././Header";
import "./Bill.css";

const RelatedBills = ({related}) => {
  if (!related) return <div>No related bills</div>
  return (
    <div>
      {Object.values(related).map((bill) => (<div key={bill.printNo}><a href={`/bill/${bill.session}/${bill.printNo}`}>{bill.printNo}</a>: {bill.title}</div>))}
    </div>
  );
  }
RelatedBills.propTypes = {
  related: PropTypes.object.isRequired,
};

function getSponsorNumber(billData) {
  const { activeVersion, amendments: { items } } = billData;
  return 1 + items[activeVersion].coSponsors.size + items[activeVersion].multiSponsors.size;
}

export const Bill = () => {
  const { sessionYear, printNo } = useParams();
  const [bill, setBill] = useState();
  const [nayMembersData, setNayMembersData] = useState([]);

  useEffect(() => {
    const fetchBill = async () => {
      const res = await fetch(`/api/v1/bills/${sessionYear}/${printNo}`);
      const billData = await res.json();
      setBill(billData);
    };
    fetchBill();
  }, [sessionYear, printNo]);

  useEffect(() => {
    const fetchMembers = async () => {
      const nayMembers = bill?.votes?.items[bill.votes.items.length - 1]?.memberVotes?.items?.NAY?.items || [];
      const promises = nayMembers.map(async member => {
        const res = await fetch(`https://v3.openstates.org/people?jurisdiction=New%20York&district=${member.districtCode}&include=offices&page=1&per_page=1&apikey=7747347d-782f-43d1-b3e5-8c4bed578a27`);
        const data = await res.json();
        return data.results[0];
      });
      const nayMembersData = await Promise.all(promises);
      setNayMembersData(nayMembersData);
    };

    if (bill) {
      fetchMembers();
    }
  }, [bill]);

  if (!bill) return (
    <div>
      <div>This is the bill {printNo}&apos;s page</div>
    </div>
  );

  const {
    title,
    summary,
    sponsor: {
      member: { fullName: sponsorName },
    },
  } = bill;

  return (
    <div>
      <Header></Header>
      <div className="summary">
        <h2>{title}</h2>
        <p>{summary}</p>
      
        <div className="category">
          {bill.category} Sample Category
        </div><br />
        <p>
          Sponsored by <span style={{fontWeight:'bold'}}>{sponsorName}</span>
          <br />
          District {bill.sponsor.member.districtCode}
        </p>
        <p>Status: <span style={{fontWeight:'bold'}}>{bill.status.statusDesc}</span></p>
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
        {RelatedBills}
      </div>
      
      <div className="action">
        <h2>Take Action!</h2>
        <p>Members currently AGAINST this bill:</p>
        <ul>
        { nayMembersData.map(member => (
          <li key={member.id}>
            {member.name}:{" "}
            {member.offices.map(office => (
              <div key={office.address}>
                <a href={`tel:${office.voice}`}>
                  {office.voice}
                </a> - {office.address.split(',').slice(-2)[0].trim()}
              </div>
            ))}
          </li>
        ))}
        </ul>
        <h2>Script</h2>
        <div className="script">
          <p>
            Hi, my name is [NAME] and I&#39;m a constituent from [CITY, ZIP].
            <br />
            <br />
            I&#39;m calling to urge [REP/SEN NAME] to vote YES on {printNo}.
            <br />
            Thank you for your time and consideration.
            <br />
            <br />
            IF LEAVING A VOICEMAIL: Please leave your full street address to
            ensure your call is tallied.
          </p>
        </div>
      </div>
    </div>
  );
};
