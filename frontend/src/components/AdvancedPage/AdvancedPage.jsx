import { styled } from '@mui/material';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import { LegislatorRow } from './LegislatorRow';
import {
  fetchLegislators,
  fetchBillCampaignMappings,
  fetchBillsBlocks,
} from './requests';

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
const BillTableHeaderCell = ({ bill }) => (
  <>
    <BillTitleTooltip
      title={bill.title}
      arrow
      placement="bottom"
      // Useful for debugging
      // open={bill.printNo === 'S1570'}
      // open={false}
    >
      <th style={{ textAlign: 'center' }}>{bill.printNo}</th>
    </BillTitleTooltip>
  </>
);
BillTableHeaderCell.propTypes = {
  bill: PropTypes.object.isRequired,
};

const BillTableHeader = ({ senateBills, assemblyBills }) => {
  // fixme: show full bill title on hover, partial title in cell
  return (
    <>
      {Object.values(senateBills)
        .concat(Object.values(assemblyBills))
        .map((bill) => (
          <BillTableHeaderCell key={bill.basePrintNo} bill={bill} />
        ))}
    </>
  );
};
BillTableHeader.propTypes = {
  senateBills: PropTypes.object.isRequired,
  assemblyBills: PropTypes.object.isRequired,
};

export const AdvancedPage = () => {
  const [billCampaignMappings, setBillCampaignMappings] = useState();
  const [campaigns, setCampaigns] = useState();
  const [senateBills, setSenateBills] = useState({});
  const [assemblyBills, setAssemblyBills] = useState({});
  const [senators, setSenators] = useState([]);
  const [assemblyers, setAssemblyMembers] = useState([]);

  // Sponsor object for quicker lookups
  const billSponsors = {};
  Object.values(senateBills)
    .concat(Object.values(assemblyBills))
    .forEach((bill) => {
      let sponsorSet = new Set();

      // Use non-main sponsor first to fill Set more efficiently
      const amendmentItems = bill?.amendments?.items || {};
      Object.values(amendmentItems).forEach((amendmentItem) => {
        const cosponsors = amendmentItem.coSponsors?.items || [];

        // Create Set in bulk
        sponsorSet = new Set(cosponsors.map((cs) => cs.memberId));
        // cosponsors.forEach((cosponsor) => sponsorSet.add(cosponsor.memberId));
      });

      const mainSponsor = bill?.sponsor?.member?.memberId;
      sponsorSet.add(mainSponsor);

      // todo: check if some use cosponsor instead of amendments
      // None seem to actually use the field

      billSponsors[bill.basePrintNo] = sponsorSet;
    });

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
            <BillTableHeader
              senateBills={senateBills}
              assemblyBills={assemblyBills}
            />
          </tr>
        </thead>
        <tbody>
          {senators.map((senator) => (
            <LegislatorRow
              key={senator.memberId}
              member={senator}
              bills={Object.values(senateBills).concat(
                Object.values(assemblyBills)
              )}
              billSponsors={billSponsors}
            />
          ))}
          {assemblyers.map((assemblyer) => (
            <LegislatorRow
              key={assemblyer.memberId}
              member={assemblyer}
              bills={Object.values(senateBills).concat(
                Object.values(assemblyBills)
              )}
              billSponsors={billSponsors}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
