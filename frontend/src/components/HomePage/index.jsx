import { useState, useEffect } from 'react';
import './HomePage.css';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';

const HomePage = () => {
  const [bills, setBills] = useState([]);

  // TODO: to improve
  useEffect(() => {
    const paginateBills = async () => {
      let offset = 1;
      let done = false;
      while (!done) {
        const res = await fetch(`/api/v1/bills/2023/search?offset=${offset}`);
        const out = await res.json()
        await setBills((prevBills) => [...prevBills].concat(out.result.items.map(item => item.result)));
        offset = out.offsetEnd;
        // if (out.offsetEnd >= out.total) done = true;
        done = true;
      }
    }
    paginateBills()
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
