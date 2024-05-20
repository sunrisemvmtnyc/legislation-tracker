import { useState, useEffect } from 'react';
import './HomePage.css';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';

const HomePage = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('*');
  const [campaignMappings, setCampaignMappings] = useState({});
  const [campaigns, setCampaigns] = useState({});
  const [campaignFilter, setCampaignFilter] = useState([]);

  const campaignList = Object.values(campaigns);

  // fetch bills
  useEffect(() => {
    // Correctly handle double-mount in dev/StrictMode
    // https://stackoverflow.com/a/72238236
    const abortController = new AbortController();

    // TODO: does not fetch all bills, only first page
    const paginateBills = async () => {
      let offset = 1;
      let done = false;
      while (!done) {
        try {
          const queryStr = new URLSearchParams({
            offset,
            term: searchTerm,
            // categories: campaignFilter?.join(','), // fixme
          }).toString();
          const res = await fetch(`/api/v1/bills/2023/search?${queryStr}`, {
            signal: abortController.signal,
          });
          const out = await res.json();
          await setBills((prevBills) =>
            [...prevBills].concat(out.result.items.map((item) => item.result))
          );
          offset = out.offsetEnd;
          // if (out.offsetEnd >= out.total) done = true;
          done = true;
        } catch (error) {
          console.log('Home bills request aborted');
          done = true;
        }
      }
    };

    paginateBills();
    return () => {
      abortController.abort();
      setBills([]);
    };
  }, [campaignFilter, searchTerm]);

  // Fetch campaign mappings and campaigns
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
          {bills.map((bill) => (
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
