import { useState, useEffect } from 'react';
import './HomePage.css';
import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';

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


const HomePage = () => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/v1/bills/2023/search`, { signal: abortController.signal });
        const data = await res.json();
        // Assign categories to each bill
        const billsWithCategories = data.result.items.map(item => ({
          ...item.result,
          categories: getCategories(item.result.summary)
        }));
        setBills(billsWithCategories);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <>
      <Banner />
      <div id='home-page'>
        <h1>Sunrise featured bills</h1>
        <Filters />
        <div id='home-bill-grid'>
        {bills.map(bill => <Card bill={bill} key={bill.basePrintNoStr} categories={bill.categories} />)}
        </div>
      </div>
    </>
  );
};

export default HomePage;