import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import { LegislatorRow } from './LegislatorRow';
import {
  fetchLegislators,
} from '../../api/requests';
import useSunriseBills from '../../api/useSunriseBills';

/** Individual th cell for a bill */
const BillTableHeaderCell = ({ bill }) => <th>{bill.title}</th>;
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

const AdvancedPage = () => {
  const [senators, setSenators] = useState([]);
  const [assemblyers, setAssemblyMembers] = useState([]);

  const { senateBills, assemblyBills, campaigns, billCampaignMappings } = useSunriseBills();

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

    fetchLegislators(abortController, setAssemblyMembers, setSenators).catch(
      (e) => {
        if (e.name !== 'AbortError') throw e;
      }
    );

    return () => {
      abortController.abort();
      setAssemblyMembers([]);
      setSenators([]);
    };
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>District Code</th>
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

export default AdvancedPage;
