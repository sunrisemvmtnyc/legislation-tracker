import { useState, useEffect } from 'react';
import './HomePage.css';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';

const HomePage = () => {
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('*');
  const [_campaignMappings, setCampaignMappings] = useState({});
  const [campaigns, setCampaigns] = useState({});
  const [baseSearchTermsObj, setSearchTermsObj] = useState({});
  const [campaignFilter, setCampaignFilter] = useState([]);

  // TODO: remove after review
  const campaignMappings = Object.keys(_campaignMappings).length
    ? {
        ..._campaignMappings,
        A2229: ['recaKM8EyeUejwpBf'],
      }
    : _campaignMappings;

  const billsToDisplay = campaignFilter.length
    ? bills.filter((bill) =>
        campaignMappings[bill.basePrintNo]?.some((relatedCampaignId) =>
          campaignFilter.includes(relatedCampaignId)
        )
      )
    : bills;

  const campaignList = Object.values(campaigns);

  // Fetch bills on page load & filter change
  useEffect(() => {
    // Skip if campaigns are not yet fetched
    if (campaignStatus !== RequestStatus.DONE) return;

    const searchObjWithCampaignBills = addCampaignBillsToSearchObj(
      campaignMappings,
      baseSearchTermsObj
    );

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
  }, [searchTerm]);

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
          setSearchTermsObj={setSearchTermsObj}
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
