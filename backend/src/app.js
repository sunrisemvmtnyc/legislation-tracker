import 'dotenv/config';

import express from 'express';
import fetch from 'node-fetch';

import { legApi } from './nysenate-api.js';
import { resetCache, getBillsWithCache } from './caching.js';

// Create Express server
const host = '0.0.0.0';
const port = 3001;
const app = express();

// Global constants
const BILL_PAGE_SIZE = 3000;


// Endpoint to get all the bills in a year
app.get('/api/v1/bills/:year', async (req, res) => {
  let bills = await getBillsWithCache(req.params.year);

  let start = 0;
  if (parseInt(req.query.start)) start = parseInt(req.query.start);

  const slicedBills = bills.slice(start, start + BILL_PAGE_SIZE);

  res.json({
    end: start + BILL_PAGE_SIZE < bills.length ? start + BILL_PAGE_SIZE : 0,
    bills: slicedBills,
  });
});

// Endpoint to get a single bill
app.get('/api/v1/bills/:year/:printNumber', async (req, res) => {
  const url = legApi(`bills/${req.params.year}/${req.params.printNumber}`, { view: 'with_refs' })
  let apiResponse = await fetch(url);
  res.json((await apiResponse.json()).result);
});

// Listen
app.listen(port, host, () => {
  console.log(`Example app listening at http://${host}:${port}`);
  resetCache();
});
