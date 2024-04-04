import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

// Hardcoded values for specific tables/fields in Airtable
const AIRTABLE_BASE_ID = 'appBS7e3igXNBXl9b';
const TABLE_ID = 'tblCJq2YX259pH5ij'; // ImportedScorecard
const SENATE_ID_AIRTABLE_FIELD_ID = 'Senate Number';
const ASSEMBLY_ID_AIRTABLE_FIELD_ID = 'Assembly Number';
const CAMPAIGN_AIRTABLE_FIELD_ID = 'Campaign';

const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY });
const base = airtable.base(AIRTABLE_BASE_ID);

export const fetchSunriseBills = async () => {
  // NOTE: Airtable fetches aren't promises by default, wtf...
  // Here we wrap the fetch in a promise to make it easier to work with
  const out = new Promise((resolve, reject) => {
    let allRecords = [];
    base(TABLE_ID)
      .select({
        view: 'Grid view',
        fields: [
          SENATE_ID_AIRTABLE_FIELD_ID,
          ASSEMBLY_ID_AIRTABLE_FIELD_ID,
          CAMPAIGN_AIRTABLE_FIELD_ID,
        ],
      })
      .eachPage(
        (records, fetchNextPage) => {
          allRecords = allRecords.concat(records);
          fetchNextPage();
        },
        (err) => {
          if (err) reject(err);
          resolve(allRecords);
        }
      );
  });

  // Handle the promise we created above
  let records = [];
  try {
    records = await out;
  } catch (err) {
    console.error('fetchSunriseBills from airtable error', err);
    return {};
  }

  // Key campaign to assembly/senate bill id
  const mapping = {};
  records.forEach((record) => {
    const senateId = record.get(SENATE_ID_AIRTABLE_FIELD_ID);
    const assemblyId = record.get(ASSEMBLY_ID_AIRTABLE_FIELD_ID);
    const campaign = record.get(CAMPAIGN_AIRTABLE_FIELD_ID);
    if (!campaign) return;

    // Add campaign to the senate bill
    if (senateId) {
      if (senateId.startsWith('S')) {
        if (!mapping[senateId]) {
          mapping[senateId] = [];
        }
        mapping[senateId].push(campaign);
      } else console.log('Senate ID not properly formatted:', senateId);
    }

    // Add campaign to the assembly bill
    if (assemblyId) {
      if (assemblyId.startsWith('A')) {
        if (!mapping[assemblyId]) {
          mapping[assemblyId] = [];
        }
        mapping[assemblyId].push(campaign);
      } else console.log('Assebly ID not properly formatted:', assemblyId);
    }
  });
  return mapping;
};
