import { useState, useEffect } from 'react';
import './HomePage.css';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';
import { fetchBillsBlocks } from '../../requests';

/** Simple enum to show request status */
const RequestStatus = {
  NONE: 'none',
  FETCHING: 'fetching',
  DONE: 'done',
};

/** Only search for sunrise campaign bills
 *
 * Gets bills for all campaigns, even if user has filtered out some specific campaigns
 */
const addCampaignBillsToSearchObj = (campaignMappings, searchObj) => {
  const billIds = new Set();
  Object.keys(campaignMappings).forEach((billId) => billIds.add(billId));

  return { ...searchObj, basePrintNo: Array.from(billIds) };
};

const HomePage = () => {
  const [bills, setBills] = useState([]);
  const [campaignMappings, setCampaignMappings] = useState({});
  const [campaigns, setCampaigns] = useState({});
  const [campaignStatus, setCampaignStatus] = useState(RequestStatus.NONE);

  const [baseSearchTermsObj, setSearchTermsObj] = useState({});
  const [campaignFilter, setCampaignFilter] = useState([]);

  const campaignBills = campaignFilter.length
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
    fetchBillsBlocks(abortController, searchObjWithCampaignBills, (newBills) =>
      setBills((prev) => [...prev, ...newBills])
    ).catch((e) => {
      if (e.name !== 'AbortError') throw e;
    });

    return () => {
      abortController.abort();
      setBills([]);
    };
  }, [baseSearchTermsObj, campaignStatus, campaignMappings]);

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
        setCampaignStatus(RequestStatus.DONE);
      } catch (error) {
        console.log('Sunrise campaign & bill request aborted');
      }
    };

    fetchCampaignsAndCampaignMappings();
    return () => {
      abortController.abort();
      setCampaigns({});
      setCampaignMappings({});
      setCampaignStatus(RequestStatus.NONE);
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
          {campaignBills.map((bill) => (
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
