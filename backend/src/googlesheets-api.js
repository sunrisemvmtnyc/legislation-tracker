import { sheets } from '@googleapis/sheets';

const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

// Google sheets spreadsheet ID - can be found in the URL after /d/
const GOOGLE_SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

// Page/tab within spreadsheet
const SHEET_NAME = "'Cosponsors on Bills'";
const CATEGORY_ROW = 1;
const NAME_ROW = 2;
const SENATE_BILL_ID_ROW = 3;
const ASSEMBLY_BILL_ID_ROW = 9;
const FIRST_BILL_COLUMN = 'I';

const MIN_ROW = Math.min(
  CATEGORY_ROW,
  NAME_ROW,
  SENATE_BILL_ID_ROW,
  ASSEMBLY_BILL_ID_ROW
);
const MAX_ROW = Math.max(
  CATEGORY_ROW,
  NAME_ROW,
  SENATE_BILL_ID_ROW,
  ASSEMBLY_BILL_ID_ROW
);

const FIRST_BILL_ARRAY_COLUMN =
  FIRST_BILL_COLUMN.charCodeAt(0) - 'A'.charCodeAt(0);

export const fetchSunriseBills = async () => {
  const api = sheets({ version: 'v4', auth: GOOGLE_SHEETS_API_KEY });
  const range = `${SHEET_NAME}!${MIN_ROW}:${MAX_ROW}`;

  let rows = [];
  try {
    const res = await api.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SPREADSHEET_ID,
      range: range,
    });
    rows = res.data.values;
  } catch (err) {
    console.error('fetchSunriseBills error', err);
    return {};
  }

  if (!rows || rows.length === 0) {
    console.error('No data found from Sunrise Google Sheet.');
    return {};
    // console.log('fetchBills response', res);
  } else if (rows.length != MAX_ROW - MIN_ROW + 1) {
    console.error(
      `Only found ${rows.length} rows in Sunrise Google Sheet, expected ${MAX_ROW - MIN_ROW + 1}`
    );
    return {};
  }
  // console.log('fetchBills response data', res.data);

  rows = [
    rows[CATEGORY_ROW - 1],
    rows[NAME_ROW - 1],
    rows[SENATE_BILL_ID_ROW - 1],
    rows[ASSEMBLY_BILL_ID_ROW - 1],
  ];

  let columnError = false;
  rows = rows.map((row, i) => {
    if (row.length < FIRST_BILL_ARRAY_COLUMN + 1) {
      columnError = true;
      console.error(
        `Row ${i + 1} has ${row.length} columns, expected ${FIRST_BILL_ARRAY_COLUMN + 1}`
      );
      return {};
    }
    return row.slice(FIRST_BILL_ARRAY_COLUMN);
  });

  if (columnError) {
    return {};
  }

  // eslint-disable-next-line no-unused-vars
  const [categoryRow, nameRow, senateBillIdRow, assemblyBillIdRow] = rows;

  // console.log(rows);
  const nameMapping = {};
  nameRow.forEach((fullBillDescription, i) => {
    // Remove unnecessary comment after newline
    let billDescription = fullBillDescription;
    billDescription = billDescription.split('\n')[0];

    const senateId = senateBillIdRow[i];
    const assemblyId = assemblyBillIdRow[i];

    if (senateId.startsWith('S')) {
      if (!nameMapping[senateId]) {
        nameMapping[senateId] = [];
      }
      nameMapping[senateId].push(billDescription);
    }
    if (assemblyId.startsWith('A')) {
      if (!nameMapping[assemblyId]) {
        nameMapping[assemblyId] = [];
      }
      nameMapping[assemblyId].push(billDescription);
    }
  });

  return nameMapping;
};
