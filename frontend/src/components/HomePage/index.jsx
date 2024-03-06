import { useState, useEffect } from 'react';
import './HomePage.css';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';

const HomePage = () => {
  const [bills, setBills] = useState([]);

  // TODO: to improve
  useEffect(() => {

    // Correctly handle double-mount in dev/StrictMode
    // https://stackoverflow.com/a/72238236
    const abortController = new AbortController();

    const paginateBills = async () => {
      let offset = 1;
      let done = false;
      while (!done) {
        try {
          const res = await fetch(`/api/v1/bills/2023/search?offset=${offset}`, {
            signal: abortController.signal,
          });
          const out = await res.json()
          await setBills((prevBills) => [...prevBills].concat(out.result.items.map(item => item.result)));
          offset = out.offsetEnd;
        } catch (error) {
          console.log('Home bills request aborted')
        }
        done = true;
      }
    }
    paginateBills()
    return () => {
      setBills([])
      abortController.abort()
    }
    // console.log('running useeffect'
  }, []); // Only run on initial page load

  return (
    <>
      <Banner />
      <div id='home-page'>
        <h1>Sunrise featured bills</h1>
        <Filters />
        <div id='home-bill-grid'>
          {bills.map(bill => <Card bill={bill} key={bill.basePrintNoStr} />)}
        </div>
      </div>
    </>
  );
};

export default HomePage;
