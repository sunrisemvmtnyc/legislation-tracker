import { styled } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import './AdvancedPage.css';
import { LegislatorRow } from './LegislatorRow';
import { fetchLegislators } from './requests';
import { fetchBillCampaignMappings, fetchBillsBlocks } from '../../requests';
import {
  collectBillPairs,
  collectBillSponsors,
  unpassedBillCounts,
} from './utils';

const BillTitleTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(24),
    border: '1px solid #dadde9',
  },
}));

/** Individual th cell for a bill */
const BillTableHeaderCell = ({
  senate,
  assembly,
  billCampaignMappings,
  campaigns,
}) => (
  <>
    <BillTitleTooltip
      title={senate?.title || assembly?.title || '--'}
      arrow
      placement="bottom"
      // Useful for debugging
      // open={bill.printNo === 'S1570'}
      // open={false}
    >
      <th style={{ textAlign: 'center' }}>
        {billCampaignMappings[senate?.printNo || assembly?.printNo]
          .map((campaignId) => campaigns[campaignId].short_name)
          .join(' ')}{' '}
        {senate?.printNo || '--'} {assembly?.printNo || '--'}
      </th>
    </BillTitleTooltip>
  </>
);
BillTableHeaderCell.propTypes = {
  senate: PropTypes.object,
  assembly: PropTypes.object,
  billCampaignMappings: PropTypes.object.isRequired,
  campaigns: PropTypes.object.isRequired,
};

const BillTableHeader = ({ billPairs, billCampaignMappings, campaigns }) => {
  // fixme: show full bill title on hover, partial title in cell
  return (
    <>
      {billPairs.map(([senate, assembly]) => (
        <BillTableHeaderCell
          key={senate?.printNo || assembly?.printNo}
          senate={senate}
          assembly={assembly}
          billCampaignMappings={billCampaignMappings}
          campaigns={campaigns}
        />
      ))}
    </>
  );
};
BillTableHeader.propTypes = {
  billPairs: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
  billCampaignMappings: PropTypes.object.isRequired,
  campaigns: PropTypes.object.isRequired,
};

export const AdvancedPage = () => {
  const [billCampaignMappings, setBillCampaignMappings] = useState({});
  const [campaigns, setCampaigns] = useState();
  const [senateBills, setSenateBills] = useState({});
  const [assemblyBills, setAssemblyBills] = useState({});
  const [senators, setSenators] = useState([]);
  const [assemblyers, setAssemblyMembers] = useState([]);
  const [legFilter, setLegFilter] = useState('');
  const [billFilter, setBillFilter] = useState('');

  const filteredSenators = senators.filter((senator) =>
    (senator?.fullName ?? '').toLowerCase().includes(legFilter.toLowerCase())
  );
  const filteredAssemblyers = assemblyers.filter((assemblyer) =>
    (assemblyer?.fullName ?? '').toLowerCase().includes(legFilter.toLowerCase())
  );

  const billPairs = collectBillPairs(senateBills, assemblyBills);
  const filteredBillPairs = billPairs.filter(
    ([senateBill, assemblyBill]) =>
      senateBill?.title?.toLowerCase().includes(billFilter.toLowerCase()) ||
      senateBill?.printNo?.toLowerCase().includes(billFilter.toLowerCase()) ||
      assemblyBill?.title?.toLowerCase().includes(billFilter.toLowerCase()) ||
      assemblyBill?.printNo?.toLowerCase().includes(billFilter.toLowerCase())
  );

  // Sponsor object for quicker lookups
  const billSponsors = collectBillSponsors(senateBills, assemblyBills);

  // Used for calculating percentages in LegislatorRow
  const {
    unpassedAssemblyBillCount,
    unpassedAssemblyClimateBillCount,
    unpassedSenateBillCount,
    unpassedSenateClimateBillCount,
  } = unpassedBillCounts(
    senateBills,
    assemblyBills,
    billCampaignMappings,
    campaigns
  );

  useEffect(() => {
    // Correctly handle double-mount in dev/StrictMode
    // https://stackoverflow.com/a/72238236
    const abortController = new AbortController();

    fetchBillCampaignMappings(
      abortController,
      setCampaigns,
      setBillCampaignMappings
    )
      .then((bcm) => {
        const searchObj = {
          printNo: Object.keys(bcm),
        };

        // Helper method to format bills from fetchBillsBlocks method
        const billSetter = (bills) => {
          const [senate, assembly] = [{}, {}];
          bills.forEach((bill) => {
            const billId = bill.printNo;
            if (billId.startsWith('S')) senate[billId] = bill;
            if (billId.startsWith('A')) assembly[billId] = bill;
          });
          setSenateBills((prev) => ({ ...prev, ...senate }));
          setAssemblyBills((prev) => ({ ...prev, ...assembly }));
        };
        fetchBillsBlocks(abortController, searchObj, billSetter);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') throw e;
      });

    fetchLegislators(abortController, setAssemblyMembers, setSenators).catch(
      (e) => {
        if (e.name !== 'AbortError') throw e;
      }
    );

    return () => {
      abortController.abort();
      setCampaigns(undefined);
      setBillCampaignMappings(undefined);
      setSenateBills({});
      setAssemblyBills({});
      setAssemblyMembers([]);
      setSenators([]);
    };
  }, []);

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Filter Legislators"
          value={legFilter}
          onChange={(e) => setLegFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter Bills"
          value={billFilter}
          onChange={(e) => setBillFilter(e.target.value)}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>All Leg pct</th>
            <th>Climate Leg pct</th>
            <BillTableHeader
              billPairs={filteredBillPairs}
              billCampaignMappings={billCampaignMappings}
              campaigns={campaigns}
            />
          </tr>
        </thead>
        <tbody>
          {filteredSenators.map((senator) => (
            <LegislatorRow
              key={senator.memberId}
              member={senator}
              bills={billPairs.map((pair) => pair[0])}
              filteredBills={filteredBillPairs.map((pair) => pair[0])}
              campaigns={campaigns}
              billCampaignMappings={billCampaignMappings}
              billSponsors={billSponsors}
              unpassedBillCount={unpassedSenateBillCount}
              unpassedClimateBillCount={unpassedSenateClimateBillCount}
            />
          ))}
          {filteredAssemblyers.map((assemblyer) => (
            <LegislatorRow
              key={assemblyer.memberId}
              member={assemblyer}
              bills={billPairs.map((pair) => pair[1])}
              filteredBills={filteredBillPairs.map((pair) => pair[1])}
              campaigns={campaigns}
              billCampaignMappings={billCampaignMappings}
              billSponsors={billSponsors}
              unpassedBillCount={unpassedAssemblyBillCount}
              unpassedClimateBillCount={unpassedAssemblyClimateBillCount}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
