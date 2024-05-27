import { useState, useEffect } from 'react';
import './HomePage.css';

import useSunriseBills from '../../api/useSunriseBills';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('*');
  const [campaignMappings, setCampaignMappings] = useState({});
  const [campaigns, setCampaigns] = useState({});
  const [campaignFilter, setCampaignFilter] = useState([]);
  const { senateBills, assemblyBills } = useSunriseBills(searchTerm);

  const bills = Object.values(senateBills).concat(Object.values(assemblyBills));

  const billsToDisplay = campaignFilter.length
    ? bills.filter((bill) =>
        campaignMappings[bill.basePrintNo]?.some((relatedCampaignId) =>
          campaignFilter.includes(relatedCampaignId)
        )
      )
    : bills;

  const campaignList = Object.values(campaigns);

  useEffect(() => {
    // Correctly handle double-mount in dev/StrictMode
    // https://stackoverflow.com/a/72238236
    const abortController = new AbortController();

    const fetchCampaignsAndCampaignMappings = async () => {
      try {
        const res = await fetch(`/api/v1/bills/airtable-bills`, {
          signal: abortController.signal,
        });
        const data = await res.json();
        const { bills, campaigns } = data;
        setCampaignMappings(bills);
        setCampaigns(campaigns);
      } catch (error) {
        console.log('Sunrise campaign & bill request aborted');
      }
    };

    fetchCampaignsAndCampaignMappings();
    return () => {
      abortController.abort();
      setCampaigns({});
      setCampaignMappings({});
    };
  }, []); // Only run on initial page load

  return (
    <>
      <Banner />
      <div id="home-page">
        <h1>Sunrise featured bills</h1>
        <Filters
          campaignList={campaignList}
          setCampaignFilter={setCampaignFilter}
          setSearchTerm={setSearchTerm}
        />
        <div id="home-bill-grid">
          {billsToDisplay.map((bill) => (
            <Card
              bill={bill}
              key={bill.basePrintNoStr}
              billCampaignMappings={campaignMappings[bill.basePrintNo] || []}
              allCampaigns={campaigns}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
