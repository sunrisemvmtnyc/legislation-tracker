import { useState, useEffect } from 'react';
import './HomePage.css';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';
import { fetchBillsBlocks } from '../../requests';
import { getSponsorMembers } from '../../utils';

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

/** Get direct sponsors for all bills. Does _not_ include cosponsors
 *
 * @param {Array} bills - Array of bill objects from legislative API
 * @returns {Array} - Array of sponsor objects in format for Dropdown: {displayName: string, value: string (id)}
 */
const getSponsorList = (bills) => {
  // Use set to prevent duplicates
  const sponsorIds = new Set();

  // Create list of sponsor objects
  let sponsorList = bills
    .map((bill) => {
      const sponsorObj = getSponsorMembers(bill);
      return {
        displayName: sponsorObj?.sponsor?.fullName,
        value: sponsorObj?.sponsor?.memberId,
      };
    })
    .filter((x) => !!x.displayName && !!x.value);

  // Filter out dupes
  sponsorList = sponsorList.filter((sponsorOption) => {
    if (sponsorIds.has(sponsorOption.value)) {
      return false;
    }
    sponsorIds.add(sponsorOption.value);
    return true;
  });

  return sponsorList;
};

const HomePage = () => {
  const [bills, setBills] = useState([]);
  const [billStatus, setBillStatus] = useState(RequestStatus.NONE);
  const [campaignMappings, setCampaignMappings] = useState({});
  const [campaigns, setCampaigns] = useState({});
  const [campaignStatus, setCampaignStatus] = useState(RequestStatus.NONE);

  const [baseSearchTermsObj, setSearchTermsObj] = useState({});
  const [campaignFilter, setCampaignFilter] = useState([]);
  const [legislatorFilter, setLegislatorFilter] = useState([]);

  // Apply filters to bills shown
  const campaignBills =
    campaignFilter.length || legislatorFilter.length
      ? bills.filter((bill) => {
          if (
            campaignFilter.length &&
            !campaignMappings[bill.basePrintNo]?.some((relatedCampaignId) =>
              campaignFilter.includes(relatedCampaignId)
            )
          )
            return false;
          if (
            legislatorFilter.length &&
            !legislatorFilter.includes(getSponsorMembers(bill).sponsor.memberId)
          )
            return false;
          return true;
        })
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
    )
      .then(() => setBillStatus(RequestStatus.DONE))
      .catch((e) => {
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
          sponsorList={getSponsorList(bills)}
          campaignList={campaignList}
          setCampaignFilter={setCampaignFilter}
          setSearchTermsObj={setSearchTermsObj}
          setLegislatorFilter={setLegislatorFilter}
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
