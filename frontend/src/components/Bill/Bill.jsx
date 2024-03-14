import {PropTypes} from "prop-types";
import {useState, useEffect, useCallback} from "react";
import { useParams } from "react-router-dom";
import './Bill.css';
import CategoryTag from "../Category/CategoryTag";

const MAPBOX_TOKEN = import.meta.env.MAPBOX_TOKEN;
const OPENSTATES_API_KEY = import.meta.env.OPENSTATES_API_KEY;

const RelatedBills = ({ related }) => {
  if (!related) return <div>No related bills</div>;
  return (
    <div>
      {Object.values(related).map((bill) => (
        <div key={bill.printNo}>
          <a href={`/bill/${bill.session}/${bill.printNo}`}>{bill.printNo}</a>: {bill.title}
        </div>
      ))}
    </div>
  );
};

RelatedBills.propTypes = {
  related: PropTypes.object.isRequired,
};

// Define categories and associated keywords
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

function getSponsorNumber(billData) {
  const { activeVersion, amendments: { items } } = billData;
  return 1 + items[activeVersion].coSponsors.size + items[activeVersion].multiSponsors.size;
}

export const Bill = () => {
  const { sessionYear, printNo } = useParams();
  const [bill, setBill] = useState();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [repsData, setRepsData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBill = async () => {
      const res = await fetch(`/api/v1/bills/${sessionYear}/${printNo}`);
      const billData = await res.json();
      setBill(billData);
    };
    fetchBill();
  }, [sessionYear, printNo]);

  const fetchReps = useCallback(async (lat, long) => {
    setLoading(true);
    try {
      const response = await fetch(`https://v3.openstates.org/people.geo?lat=${lat}&lng=${long}&include=offices&apikey=${OPENSTATES_API_KEY}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setRepsData(data.results);
    } catch (error) {
      console.error('Error fetching representatives:', error);
      setError('Error fetching representatives');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddressChange = (e) => {
    setQuery(e.target.value);
  };

  const debouncedFetchReps = useCallback(
    debounce(fetchReps, 500),
    [fetchReps]
  );

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (query.trim() === '') {
      setError('Please enter a location');
      return;
    }

    try {
      const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.features.length > 0) {
        const { center } = data.features[0];
        setLocation({ latitude: center[1], longitude: center[0] });
        setRepsData([]);
        setError(null);
        debouncedFetchReps(center[1], center[0]);
      } else {
        setLocation(null);
        setError('Location not found');
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      setError('Error fetching location');
    }
  };

  if (!bill) return <div>Loading...</div>;

  const {
    title,
    summary,
    sponsor: {
      member: { fullName: sponsorName },
    },
  } = bill;

  return (
    <div className="bill-content">
      <div className="summary">
        <h2>{title}</h2>
        <div className="categories">
          {getCategories(bill.summary).map(category => (
            <CategoryTag key={category} category={category} />
          ))}
        </div>
        <p>{summary}</p>
        <p>
          Sponsored by <span style={{fontWeight:'bold'}}>{sponsorName}</span>
          <br />
          District {bill.sponsor.member.districtCode}
        </p>
        <div><p>Total Sponsors: {getSponsorNumber(bill)}</p></div>
        Related bills:
        <RelatedBills related={bill.billInfoRefs.items} />
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
                  {/* <img src={rep.image} alt={rep.name} style={{ maxWidth: "200px", maxHeight: "200px" }} /> */}
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
