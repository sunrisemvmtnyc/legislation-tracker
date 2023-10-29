import 'dotenv/config';

import express from 'express';
import fetch from 'node-fetch';
import redis from 'redis';

import { getBill, getRelatedBills, requestBillsFromAPI } from './nysenate-api.js';

// Create Express server
const host = '0.0.0.0';
const port = 3001;
const app = express();

// Create redis client
const redisClient = await redis.createClient({
  socket: { host: "redis"}
}).on('error', err => console.log('Redis Client Error', err)).connect();

// Global constants
const REDIS_CACHE_TIME = 60 * 60 * 6; // seconds
const BILL_PAGE_SIZE = 3000;

const getBillsWithCache = async(year) => {
  const cachedBills = await redisClient.get(year.toString());
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
      console.log(`Successful automatic request for bills of year ${year}`);
      console.log(`Fetched ${bills.length} bills`);
      await redisClient.set(year.toString(), JSON.stringify(bills));
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
