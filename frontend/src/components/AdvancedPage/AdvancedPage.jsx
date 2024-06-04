import { styled } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import './AdvancedPage.css';
import { LegislatorRow } from './LegislatorRow';
import {
  fetchLegislators,
  fetchBillCampaignMappings,
  fetchBillsBlocks,
} from './requests';
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
const BillTableHeaderCell = ({ senate, assembly }) => (
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
        {senate?.printNo || '--'} {assembly?.printNo || '--'}
      </th>
    </BillTitleTooltip>
  </>
);
BillTableHeaderCell.propTypes = {
  senate: PropTypes.object,
  assembly: PropTypes.object,
};

const BillTableHeader = ({ billPairs }) => {
  // fixme: show full bill title on hover, partial title in cell
  return (
    <>
      {billPairs.map(([senate, assembly]) => (
        <BillTableHeaderCell
          key={senate?.basePrintNo || assembly?.basePrintNo}
          senate={senate}
          assembly={assembly}
        />
      ))}
    </>
  );
};
BillTableHeader.propTypes = {
  billPairs: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
};

export const AdvancedPage = () => {
  const [billCampaignMappings, setBillCampaignMappings] = useState({});
  const [campaigns, setCampaigns] = useState();
  const [senateBills, setSenateBills] = useState({});
  const [assemblyBills, setAssemblyBills] = useState({});
  const [senators, setSenators] = useState([]);
  const [assemblyers, setAssemblyMembers] = useState([]);

  const billPairs = collectBillPairs(senateBills, assemblyBills);

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

  // fixme: collect bills into campaigns
  const campaignBuckets = {};

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
        fetchBillsBlocks(abortController, bcm, setSenateBills, setAssemblyBills)
      )
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
      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>All Leg pct</th>
            <th>Climate Leg pct</th>
            <BillTableHeader billPairs={billPairs} />
          </tr>
        </thead>
        <tbody>
          {senators.map((senator) => (
            <LegislatorRow
              key={senator.memberId}
              member={senator}
              bills={billPairs.map((pair) => pair[0])}
              campaigns={campaigns}
              billCampaignMappings={billCampaignMappings}
              billSponsors={billSponsors}
              unpassedBillCount={unpassedSenateBillCount}
              unpassedClimateBillCount={unpassedSenateClimateBillCount}
            />
          ))}
          {assemblyers.map((assemblyer) => (
            <LegislatorRow
              key={assemblyer.memberId}
              member={assemblyer}
              bills={billPairs.map((pair) => pair[1])}
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
