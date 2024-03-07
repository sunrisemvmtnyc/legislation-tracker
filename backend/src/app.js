import 'dotenv/config';

import express from 'express';
import fetch from 'node-fetch';

import { legApi } from './nysenate-api.js';
import { categories, categoryMapping } from './categories.js'

// Create Express server
const host = '0.0.0.0';
const port = 3001;
const app = express();

// Global constants
const BILL_PAGE_SIZE = 100;


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
  const offset = req.query.offset || 1
  const sort = "_score:desc,session:desc" // taken from leg-API sample app
  const term = req.query.term || "*"

  const url = legApi(`bills/${year}/search`, {year, offset, sort, term, limit})
  const out = await (await fetch(url)).json()
  if (!out.success) {
    // TODO: upgrade expressJS when v5 is stable
    // https://expressjs.com/en/guide/error-handling.html
    console.log("Failed bill request:");
    console.log(out.message);
    console.log(url);
    next('Did not successfully retrieve bills from legislation.nysenate.gov. Response from API was marked as a failure.');
  } else {
    res.json(out);
  }
});

// Mapping from bill id to category
app.get('/api/v1/bills/category-mappings', async (_, res) => {
  res.json(categoryMapping())
})

// Endpoint to get a single bill
app.get('/api/v1/bills/:year/:printNumber', async (req, res) => {
  const url = legApi(`bills/${req.params.year}/${req.params.printNumber}`, { view: 'with_refs' })
  let apiResponse = await fetch(url);
  res.json((await apiResponse.json()).result);
});

// Category metadata
app.get('/api/v1/categories', async (_, res) => {
  res.json(categories())
})

// Listen
app.listen(port, host, () => {
  console.log(`Example app listening at http://${host}:${port}`);
});
