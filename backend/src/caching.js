import 'dotenv/config';

import redis from 'redis';

import { billsFromYear } from './nysenate-api.js';

const REDIS_CACHE_TIME = 60 * 60 * 6; // seconds

// Create redis client
const redisClient = await redis.createClient({
  socket: { host: "redis"}
}).on('error', err => console.log('Redis Client Error', err)).connect();


// TODO: gets all bills & amendments. We don't need amendments.
// Figure out how to ignore amendments
// "Bills typically get amended and their print no gets suffixed with an amendment letter (e.g. S1234B). The bill API
// returns bill responses that contain every amendment version so you should just provide the base print no
// (e.g. S1234)."
export const getBillsWithCache = async(year) => {
  const cachedBills = await redisClient.get(year.toString());
  if (cachedBills && cachedBills.length > 0) return JSON.parse(cachedBills);
  else return [];
};

export const resetCache = async() => {
  console.log('resetting cache automatically');
  const years = [2023];
  let nextCacheResetTime = REDIS_CACHE_TIME * 1000; // JS expects ms
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    console.log(`Making automatic request for bills of year ${year}`);
    try {
      let bills = await billsFromYear(year);
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