import 'dotenv/config';

import express from 'express';
import fetch from 'node-fetch';

import { legApi, membersFromYear } from './nysenate-api.js';
import { categories } from './categories.js';
import { openStatesApi } from './openstates-api.js';
import { mapBoxApi } from './mapbox-api.js';
import { fetchSunriseBills } from './airtable-api.js';

import fs from 'fs';

// Create Express server
const host = '0.0.0.0';
const port = 3001;
const app = express();

// Global constants
const BILL_PAGE_SIZE = 100;
const MEMBER_PAGE_SIZE = 1000;

// Endpoint to get all the bills in a year
// FIXME: legacy, delete
// app.get('/api/v1/bills/:year', async (req, res) => {
//   let bills = await getBillsWithCache(req.params.year);

//   let start = 0;
//   if (parseInt(req.query.start)) start = parseInt(req.query.start);

//   const slicedBills = bills.slice(start, start + BILL_PAGE_SIZE);

//   res.json({
//     end: start + BILL_PAGE_SIZE < bills.length ? start + BILL_PAGE_SIZE : 0,
//     bills: slicedBills,
//   });
// });

// Paginated & searchable endopint
app.get('/api/v1/bills/:year/search', async (req, res, next) => {
  const year = req.params.year;
  const limit = Math.min(req.query.limit || BILL_PAGE_SIZE);
  const offset = req.query.offset || 1;
  const sort = '_score:desc,session:desc'; // taken from leg-API sample app
  const term = req.query.term || '*';

  if (process.env.MOCK_DATA === 'true') {
    const file = fs.readFileSync(`mock/search.json`).toString();
    const data = JSON.parse(file);
    res.json(data);
    return;
  }
  const url = legApi(`bills/${year}/search`, {
    year,
    offset,
    sort,
    term,
    limit,
  });
  let out = await (await fetch(url)).json();

  if (!out.success) {
    // TODO: upgrade expressJS when v5 is stable
    // https://expressjs.com/en/guide/error-handling.html
    console.log('Failed bill request:');
    console.log(out.message);
    console.log(url);
    next(
      'Did not successfully retrieve bills from legislation.nysenate.gov. Response from API was marked as a failure.'
    );
  } else {
    res.json(out);
  }
});

// TODO: rename endpoint something more appropriate
app.get('/api/v1/bills/airtable-bills', async (_, res) => {
  res.json(await fetchSunriseBills());
});

// Endpoint to get a single bill
app.get('/api/v1/bills/:year/:printNumber', async (req, res) => {
  if (process.env.MOCK_DATA === 'true') {
    const file = fs.readFileSync(`mock/bill.json`).toString();
    const data = JSON.parse(file);
    res.json(data);
    return;
  }
  const url = legApi(`bills/${req.params.year}/${req.params.printNumber}`, {
    view: 'with_refs',
  });
  let apiResponse = await fetch(url);
  res.json((await apiResponse.json()).result);
});

// Endpoint to get all the members in a year
app.get('/api/v1/members/:year', async (req, res) => {
  const options = { limit: MEMBER_PAGE_SIZE };
  if (parseInt(req.query.offset)) options.offset = parseInt(req.query.offset);
  if (parseInt(req.query.limit)) options.limit = parseInt(req.query.limit);
  if (req.query.full !== undefined) options.full = req.query.full === 'true';

  let members = await membersFromYear(req.params.year, options);

  res.json(members);
});

// Endpoint to get a single member
app.get('/api/v1/members/:year/:memberId', async (req, res, next) => {
  const url = legApi(`members/${req.params.year}/${req.params.memberId}`);
  const out = await (await fetch(url)).json();
  if (!out.success) {
    // TODO: upgrade expressJS when v5 is stable
    // https://expressjs.com/en/guide/error-handling.html
    console.log('Failed member request:');
    console.log(out.message);
    console.log(url);
    next(
      'Did not successfully retrieve member from legislation.nysenate.gov. Response from API was marked as a failure.'
    );
  } else {
    res.json(out.result);
  }
});

app.get(
  '/api/v1/committees/:year/:chamber/:committeeName',
  async (req, res, next) => {
    // NOTE/FIXME: NY API does not have assembly committees:
    // https://legislation.nysenate.gov/static/docs/html/committees.html#get-a-current-committee-version
    const url = legApi(
      `committees/${req.params.year}/${req.params.chamber}/${req.params.committeeName}`
    );
    const out = await (await fetch(url)).json();
    if (!out.success) {
      // TODO: upgrade expressJS when v5 is stable
      // https://expressjs.com/en/guide/error-handling.html
      console.log('Failed committee request:');
      console.log(out.message);
      console.log(url);
      next(
        'Did not successfully retrieve committee from legislation.nysenate.gov. Response from API was marked as a failure.'
      );
    } else {
      res.json(out.result);
    }
  }
);

// Category metadata
app.get('/api/v1/categories', async (_, res) => {
  res.json(categories());
});

app.get('/api/v1/legislators/search/offices', async (req, res, next) => {
  const name = req.query.name;
  const url = openStatesApi('people', { name: name, include: 'offices' });
  const apiResponse = await fetch(url);
  const out = await apiResponse.json();
  if (!apiResponse.ok || !out || !out.pagination?.total_items) {
    // TODO: upgrade expressJS when v5 is stable
    // https://expressjs.com/en/guide/error-handling.html
    console.log(
      'Failed bill request:',
      apiResponse.status,
      out.detail || out.pagination?.total_items
    );
    next(
      'Did not successfully retrieve legislator from openstates.org. Response from API was marked as a failure.'
    );
  } else {
    // Note: arbitrarily using first result
    const legislator = out.results[0];
    res.json(legislator.offices);
  }
});

app.get('/api/v1/geocoding/:loc', async (req, res, next) => {
  const url = mapBoxApi(`geocoding/v5/mapbox.places/${req.params.loc}.json`, {
    country: 'US',
    fuzzyMatch: true,
  });
  const apiResponse = await fetch(url);
  const out = await apiResponse.json();
  if (!out) {
    // TODO: upgrade expressJS when v5 is stable
    // https://expressjs.com/en/guide/error-handling.html
    console.log('Failed geocode request:');
    next('Did not successfully retrieve lat/long from Mapbox');
  } else {
    res.json(out);
  }
});

// Listen
app.listen(port, host, () => {
  console.log(`Example app listening at http://${host}:${port}`);
});
