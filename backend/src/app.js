import 'dotenv/config';

import express from 'express';
import fetch from 'node-fetch';
import redis from 'redis';

// Create Express server
const host = '0.0.0.0';
const port = 3001;
const app = express();

// Create redis client
const redisClient = redis.createClient('redis://redis');

// Global constants
const REDIS_CACHE_TIME = 60 * 60 * 6; // seconds
const BILL_PAGE_SIZE = 3000;

// Format the URL with the key and given offset
function legAPI(path, offset = '0') {
  return `https://legislation.nysenate.gov/${path}?key=${process.env.OPEN_LEGISLATION_KEY}&offset=${offset}&limit=1000`;
}

const requestBillsFromAPI = async(year) => {
  // First request with no offset
  let firstResponse = await fetch(legAPI(`api/3/bills/${year}`));
  let firstResponseData = await firstResponse.json();

  if (!firstResponseData.success) {
    throw('Did not successfully retrieve bills from legislation.nysenate.gov. Response from API was marked as a failure.');
  }

  // Retrieve the remaining pages
  let allBills = firstResponseData.result.items;
  const totalPages = Math.ceil(firstResponseData.total / 1000);
  for (let i = 1; i < totalPages; i++) {
    let offsetStart = (i * 1000) + 1;
    let nextResponse = await fetch(legAPI(`/api/3/bills/${year}`, offsetStart));
    let nextResponseData = await nextResponse.json();
    allBills = allBills.concat(nextResponseData.result.items);
  }
  return allBills;
};

const getBillsWithCache = async(year) => {
  const cachedBills = await redisClient.get(year);
  if (cachedBills && cachedBills.length > 0) return JSON.parse(cachedBills);
  else return [];
};

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
  let apiResponse = await fetch(legAPI(`/api/3/bills/${req.params.year}/${req.params.printNumber}`));
  res.json(await apiResponse.json());
});

const resetCache = async() => {
  console.log('resetting cache automatically');
  const years = [2023];
  let nextCacheResetTime = REDIS_CACHE_TIME * 1000; // JS expects ms
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    console.log(`Making automatic request for bills of year ${year}`);
    try {
      let bills = await requestBillsFromAPI(year);
      redisClient.set(year, JSON.stringify(bills));
      console.log(`Successful automatic request for bills of year ${year}`);
      console.log(`Fetched ${bills.length} bills`);
    } catch (error) {
      console.error(`Error automatically requesting bills for year ${year}`);
      console.error(error);
      // If it failed, try again in a few minutes.
      nextCacheResetTime = 600 * 1000;
      break;
    }
  }

  // reset cache again in a set amount of time
  setTimeout(resetCache, nextCacheResetTime);
};

// Listen
app.listen(port, host, () => {
  console.log(`Example app listening at http://${host}:${port}`);
  resetCache();
});
