import { useEffect, useState } from 'react';
import { fetchBillCampaignMappings, fetchBillsBlocks } from './requests';

const useSunriseBills = (searchTerm) => {
  const [billCampaignMappings, setBillCampaignMappings] = useState();
  const [campaigns, setCampaigns] = useState();
  const [senateBills, setSenateBills] = useState({});
  const [assemblyBills, setAssemblyBills] = useState({});

  useEffect(() => {
    // Correctly handle double-mount in dev/StrictMode
    // https://stackoverflow.com/a/72238236
    const abortController = new AbortController();

    fetchBillCampaignMappings(
      abortController,
      setCampaigns,
      setBillCampaignMappings
    )
      .then((bcm) =>
        fetchBillsBlocks(
          abortController,
          bcm,
          setSenateBills,
          setAssemblyBills,
          searchTerm
        )
      )
      .catch((e) => {
        if (e.name !== 'AbortError') throw e;
      });

    return () => {
      abortController.abort();
      setCampaigns(undefined);
      setBillCampaignMappings(undefined);
      setSenateBills({});
      setAssemblyBills({});
    };
  }, [searchTerm]);

  return { senateBills, assemblyBills, campaigns, billCampaignMappings };
};

export default useSunriseBills;
