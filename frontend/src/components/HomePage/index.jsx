import { useState, useEffect } from 'react';
import './HomePage.css';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';

const HomePage = () => {
  const [bills, setBills] = useState([]);
  const [categoryMappings, setCategoryMappings] = useState({});
  const [categories, setCategories] = useState({});

  useEffect(() => {
    // Correctly handle double-mount in dev/StrictMode
    // https://stackoverflow.com/a/72238236
    const abortController = new AbortController();

    // TODO: does not fetch all bills, only first page
    const paginateBills = async () => {
      let offset = 1;
      let done = false;
      while (!done) {
        try {
          const res = await fetch(
            `/api/v1/bills/2023/search?offset=${offset}`,
            {
              signal: abortController.signal,
            }
          );
          const out = await res.json();
          await setBills((prevBills) =>
            [...prevBills].concat(out.result.items.map((item) => item.result))
          );
          offset = out.offsetEnd;
          // if (out.offsetEnd >= out.total) done = true;
          done = true;
        } catch (error) {
          console.log('Home bills request aborted');
          done = true;
        }
      }
    };

    const billCategoryMappings = async () => {
      try {
        const res = await fetch(`/api/v1/bills/category-mappings`, {
          signal: abortController.signal,
        });
        setCategoryMappings(await res.json());
      } catch (error) {
        console.log('Home category mappings request aborted');
      }
    };

    const categories = async () => {
      try {
        const res = await fetch(`/api/v1/categories`, {
          signal: abortController.signal,
        });
        setCategories(await res.json());
      } catch (error) {
        console.log('Home categories request aborted');
      }
    };

    paginateBills();
    billCategoryMappings();
    categories();
    return () => {
      abortController.abort();
      setBills([]);
      setCategories({});
      setCategoryMappings({});
    };
  }, []); // Only run on initial page load

  return (
    <>
      <Banner />
      <div id="home-page">
        <h1>Sunrise featured bills</h1>
        <Filters />
        <div id="home-bill-grid">
          {bills.map((bill) => (
            <Card
              bill={bill}
              key={bill.basePrintNoStr}
              billCategoryMappings={categoryMappings[bill.basePrintNo]}
              allCategories={categories}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default HomePage;
