import { useState, useEffect } from 'react';
import './HomePage.css';

import useSunriseBills from '../../api/useSunriseBills';

import Card from './Card';
import Banner from './Banner';
import Filters from './Filters';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('*');
  const [categoryMappings, setCategoryMappings] = useState({});
  const [categories, setCategories] = useState({});

  const { senateBills, assemblyBills } = useSunriseBills(searchTerm);

  const bills = Object.values(senateBills).concat(Object.values(assemblyBills));

  useEffect(() => {
    // Correctly handle double-mount in dev/StrictMode
    // https://stackoverflow.com/a/72238236
    const abortController = new AbortController();

    const billCategoryMappings = async () => {
      try {
        const res = await fetch(`/api/v1/bills/category-mappings`, {
          signal: abortController.signal,
        });
        setCategoryMappings(await res.json());
      } catch (error) {
        console.log('Home category mappings request aborted', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/v1/categories`, {
          signal: abortController.signal,
        });
        setCategories(await res.json());
      } catch (error) {
        console.log('Home categories request aborted', error);
      }
    };

    billCategoryMappings();
    fetchCategories();
    return () => {
      abortController.abort();
      setCategories({});
      setCategoryMappings({});
    };
  }, []); // Only run on initial page load

  return (
    <>
      <Banner />
      <div id="home-page">
        <h1>Sunrise featured bills</h1>
        <Filters setSearchTerm={setSearchTerm} />
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
