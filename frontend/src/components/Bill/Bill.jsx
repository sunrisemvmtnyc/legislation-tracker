import {PropTypes} from "prop-types";
import {useState, useEffect} from "react";
import { useParams } from "react-router-dom";

import './Bill.css';
import CategoryTag from "../Category/CategoryTag";

const MAPBOX_TOKEN = "sk.eyJ1IjoidHdibGFja3dlbGwiLCJhIjoiY2x0cWMzOWsxMDRtYjJrcXdmN2R1Zml3bSJ9.IABJE1MnM1zJeYkrGUGJ9g";
const OPENSTATES_API_KEY = "2a046c1a-de61-4a68-8ad8-f6a3fd0c42f3";

const categories = {
  "Climate Jobs": [
    "jobs", "energy", "workforce", "economy", "resilience", "solar", "wind", "carbon", "efficient",
    "technology", "sustainability", "innovation", "construction", "policy", "agriculture", "transportation",
    "action", "conservation", "environmental", "renewable", "manufacturing", "research", "sector", "career"
  ],
  "Climate Justice": [
    "equity", "fairness", "justice", "resilience", "reparations", "equality", "accountability",
    "restitution", "solidarity", "access", "resource", "communities", "governance", "rights", "future",
    "environmental", "transition", "policies", "dialogue", "finance", "frontline", "vulnerable",
    "mitigation", "sustainability"
  ],
  "Transportation": [
    "transit", "vehicles", "mobility", "infrastructure", "equity", "bikes", "cities", "mass", "rail",
    "sharing", "carpooling", "shared", "smart", "public", "bus", "accessibility", "oriented", "bicycle",
    "urban", "expansion", "sustainable", "micro", "zero", "congestion"
  ],
  "Fair Housing": [
    "housing", "equity", "justice", "inclusive", "affordability", "security", "control", "assistance",
    "rights", "discrimination", "opportunities", "community", "development", "opportunities", "solutions",
    "regulation", "advocacy", "planning", "policies", "initiatives", "cooperatives", "availability", "rent"
  ],
  "Social Justice": [
    "equality", "justice", "equity", "society", "rights", "reform", "opportunity", "diversity",
    "access", "welfare", "dignity", "communities", "opportunities", "harmony", "reconciliation",
    "policies", "access", "inclusion", "democracy", "development"
  ],
  "Education": [
    "education", "school", "teacher", "student", "curriculum", "equity", "access", "reform",
    "training", "learning", "childhood", "higher", "STEM", "technology", "parent", "special",
    "resources", "policy", "infrastructure", "achievement", "funding", "retention", "readiness"
  ],
  "Government": [
    "legislature", "executive", "judiciary", "administration", "policy",
    "governance", "legislation", "regulation", "budget", "oversight",
    "authority", "accountability", "federal", "state", "local", "municipal",
    "council", "mayor", "governor", "president", "congress", "senate", "house",
    "law", "regulation", "committee", "commission", "agency", "department",
    "bureau", "office", "public", "official", "civil", "servant", "leadership",
    "rule", "decision", "policy", "legislation", "governmental", "civic",
    "constitution", "statute", "ordinance", "charter", "administration",
    "judiciary"
  ],
  "Healthcare": [
    "healthcare", "health", "medical", "hospital", "doctor", "patient",
    "nurse", "clinic", "medicine", "insurance", "provider", "treatment",
    "wellness", "pharmacy", "coverage", "vaccine", "disease", "emergency",
    "public health", "health system", "pandemic", "care", "mental health"
  ]
};

// Function to get up to 3 categories for a bill based on keyword count
const getCategories = (summary) => {
  const matchingCategories = Object.entries(categories)
    .filter(([category, keywords]) => keywords.some(keyword => summary.toLowerCase().includes(keyword)))
    .map(([category]) => category);
  return matchingCategories.slice(0, 3);
};

const RelatedBills = ({ related }) => {
  if (!related) return <div>No related bills</div>;
  return (
    <div>
      {Object.values(related).map((bill) => (<div key={bill.printNo}><a href={`/bill/${bill.session}/${bill.printNo}`}>{bill.printNo}</a>: {bill.title}</div>))}
    </div>
  );
  };
RelatedBills.propTypes = {
  related: PropTypes.object.isRequired,
};

function getSponsorNumber(billData) {
  const { activeVersion, amendments: { items } } = billData;
  return 1 + items[activeVersion].coSponsors.size + items[activeVersion].multiSponsors.size;
}

export const Bill = () => {
  const {sessionYear, printNo} = useParams();
  const [bill, setBill] = useState();

  useEffect(() => {
    const fetchBill = async() => {
      const res = await fetch(`/api/v1/bills/${sessionYear}/${printNo}`);
      await setBill(await res.json());
    };
    fetchBill();
  }, []);

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
    categories
  } = bill;

  return (
    <div className="bill-content">
      
      <div className="summary">
      <div className="categories">
          {getCategories(bill.summary).map(category => (
            <CategoryTag key={category} category={category} />
          ))}
        </div>
        <h2>{title}</h2>
        
        <p>{summary}</p>
        <p>
          Sponsored by <span style={{fontWeight:'bold'}}>{sponsorName}</span>
          <br />
          District {bill.sponsor.member.districtCode}
        </p>
        <div><p>Total Sponsors: {getSponsorNumber(bill)}</p></div>
        <p>Related bills:</p>
        <p><RelatedBills related={bill.billInfoRefs.items} /></p>
        <p>Status: <span style={{fontWeight:'bold'}}>{bill.status.statusDesc}</span></p>
        <div className="important">
          <h4>Why is this important? Why should this bill pass?</h4>
            <ol>
              <li>Reason 1</li>
              <li>Just because</li>
            </ol>
        </div>
      </div>
      
      <div className="action">
        <h2>Take Action!</h2>
        <div>
          <form onSubmit={handleAddressSubmit}>
            <input
              type="text"
              placeholder="Enter full address"
              value={query}
              onChange={handleAddressChange}
              aria-label="Enter full address"
            />
            <button type="submit">See my reps!</button>
          </form>
          {loading && <p>Loading representatives...</p>}
          {error && <p aria-live="assertive">{error}</p>}
          <div>
            <h3>Your Representatives:</h3>
            {repsData
              .filter(rep => rep.jurisdiction.classification !== "country")
              .map(rep => (
                <div key={rep.id}>
                  <h4>{rep.name} - {rep.current_role.title}</h4>
                  <img src={rep.image} alt={rep.name} style={{ maxWidth: "200px", maxHeight: "200px" }} />
                  <ul>
                  {rep.offices.map(office => {
                    const [, city] = office.address.match(/,\s*([^,]+),[^,]+$/); // Extract city from address
                    return (
                      <li>{city.trim()}: <a href={`tel:${office.voice}`}>{office.voice}</a></li>
                    );
                  })}
                  </ul>
                </div>
              ))}
          </div>
        </div>
        <h2>Script</h2>
        <div className="script">
          <p>
            Hi, my name is [NAME] and I&#39;m a constituent from [CITY, ZIP].
            <br />
            <br />
            I&#39;m calling to ask that [REP/SEN NAME] support {printNo}.
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

// Debounce function to delay fetching representatives
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export default Bill;
