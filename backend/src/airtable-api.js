import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

// Hardcoded values for specific tables/fields in Airtable
const AIRTABLE_BASE_ID = 'appBS7e3igXNBXl9b';
const BILL_TABLE_ID = 'tblCJq2YX259pH5ij'; // ImportedScorecard
const CAMPAIGNS_TABLE_ID = 'tblffq2qDxSjGmah0';

// Bill fields we care about
const BILL_SENATE_FIELD_ID = 'Senate Number';
const BILL_ASSEMBLY_ID_FIELD_ID = 'Assembly Number';
const BILL_CAMPAIGN_FIELD_ID = 'Campaign';

// Campaign fields we care about
const CAMPAIGN_LONG_NAME_FIELD_ID = 'Long Name';
const CAMPAIGN_SHORT_NAME_FIELD_ID = 'Short Name';
const CAMPAIGN_IS_CLIMATE_FIELD_ID = 'Is Climate';
const CAMPAIGN_COLOR_FIELD_ID = 'Color';

const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY });
const base = airtable.base(AIRTABLE_BASE_ID);

/** Fetches bills and their campaign ID */
const sunriseBills = async () => {
  // NOTE: Airtable fetches aren't promises by default, wtf...
  // Here we wrap the fetch in a promise to make it easier to work with
  const out = new Promise((resolve, reject) => {
    let allRecords = [];
    base(BILL_TABLE_ID)
      .select({
        view: 'Grid view',
        fields: [
          BILL_SENATE_FIELD_ID,
          BILL_ASSEMBLY_ID_FIELD_ID,
          BILL_CAMPAIGN_FIELD_ID,
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
    console.error('fetch airtable bills error', err);
    throw err;
  }

  // Key campaign to assembly/senate bill id
  const mapping = {};
  records.forEach((record) => {
    let senateId = record.get(BILL_SENATE_FIELD_ID);
    let assemblyId = record.get(BILL_ASSEMBLY_ID_FIELD_ID);
    const campaignIds = record.get(BILL_CAMPAIGN_FIELD_ID);
    if (!campaignIds || campaignIds.length === 0) return;

    // NOTE: remove leading zeros and trailing letters in bill id. Makes it easier to search.
    // Trailing letters are the amendment version, but the search api doesn't work well with them.
    // Examples:
    // S01001 -> S1001
    // S101 -> S101
    // S00101 -> S101
    senateId = senateId.replace(/(S)(0*)([1-9][0-9]*)([A-Z]*)/, '$1$3');
    assemblyId = assemblyId.replace(/(A)(0*)([1-9][0-9]*)([A-Z]*)/, '$1$3');

    // Add campaign to the senate bill
    if (senateId) {
      if (senateId.startsWith('S')) {
        if (!mapping[senateId]) {
          mapping[senateId] = [];
        }
        mapping[senateId] = mapping[senateId].concat(campaignIds);
      } else console.log('Senate ID not properly formatted:', senateId);
    }

    // Add campaign to the assembly bill
    if (assemblyId) {
      if (assemblyId.startsWith('A')) {
        if (!mapping[assemblyId]) {
          mapping[assemblyId] = [];
        }
        mapping[assemblyId] = mapping[assemblyId].concat(campaignIds);
      } else console.log('Assembly ID not properly formatted:', assemblyId);
    }
  });

  return mapping;
};

/** Fetches campaigns & their metadata */
const sunriseCampaigns = async () => {
  // NOTE: Airtable fetches aren't promises by default, wtf...
  // Here we wrap the fetch in a promise to make it easier to work with

  const out = new Promise((resolve, reject) => {
    let allRecords = [];
    base(CAMPAIGNS_TABLE_ID)
      .select({
        view: 'Grid view',
        fields: [
          CAMPAIGN_LONG_NAME_FIELD_ID,
          CAMPAIGN_SHORT_NAME_FIELD_ID,
          CAMPAIGN_IS_CLIMATE_FIELD_ID,
          CAMPAIGN_COLOR_FIELD_ID,
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

  let records = [];
  try {
    records = await out;
  } catch (err) {
    console.error('fetch airtable campaigns error', err);
    throw err;
  }

  const campaigns = {};
  records.forEach((record) => {
    const longName = record.get(CAMPAIGN_LONG_NAME_FIELD_ID);
    const shortName = record.get(CAMPAIGN_SHORT_NAME_FIELD_ID);
    const isClimate = record.get(CAMPAIGN_IS_CLIMATE_FIELD_ID);
    const color = record.get(CAMPAIGN_COLOR_FIELD_ID);
    const campaignId = record.id;
    campaigns[campaignId] = {
      long_name: longName,
      short_name: shortName,
      color,
      // Airtable returns checkboxes as `true` or `undefined` for some unknowable reason
      is_climate: isClimate,
      id: campaignId,
    };
  });

  return campaigns;
};

export const fetchSunriseBills = async () => {
  let bills = {};
  let campaigns = {};
  try {
    [bills, campaigns] = await Promise.all([
      sunriseBills(),
      sunriseCampaigns(),
    ]);
  } catch (err) {
    console.error('fetch airtable bills or campaigns error', err);
  }
  return { bills, campaigns };
};

export const fetchSingleBill = (printNumber) => {
  return new Promise((resolve, reject) => {
    // Check if it's Senate or Assembly based on printNumber
    const prefix = printNumber.startsWith('S') ? 'Senate' : 'Assembly';
    const initial = printNumber.startsWith('S') ? 'S' : 'A';

    base('ImportedScorecard')
      .select({
        view: 'Grid view',
        fields: ['Campaign', 'Importance'],
        maxRecords: 1,
        filterByFormula: `OR({${prefix} Number} = '${initial}${printNumber.slice(1)}', {${prefix} Number} = '${initial}0${printNumber.slice(1)}', {${prefix} Number} = '${initial}00${printNumber.slice(1)}')`,
      })
      .firstPage((err, records) => {
        if (err) {
          console.error('Airtable fetch error:', err);
          return reject(err); // Reject the Promise if there's an error
        }

        if (records && records.length > 0) {
          const record = records[0];
          const bill = {
            campaign: record.get('Campaign'),
            importance: record.get('Importance'),
          };
          resolve(bill); // Resolve with the bill data
        } else {
          reject(`No bill found with id ${printNumber}`);
        }
      });
  });
};

export const fetchSingleCampaign = (campaignId) => {
  return new Promise((resolve, reject) => {
    base('Campaigns').find(`${campaignId}`, function (err, campaign) {
      if (err) {
        console.error(err);
        return reject(err);
      }
      // console.log(campaign);
      resolve(campaign); // Resolve with the campaign data
    });
  });
};
