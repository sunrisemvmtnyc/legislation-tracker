import { useState, useEffect } from 'react';

import BillListItem from './BillListItem';
import Header from './Header';
import Search from './Search';
import CommitteeDropdown from './CommitteeDropdown';
import './BillList.css'

export default function BillList() {
  const [search, setSearch] = useState('');
  const [committee, setCommittee] = useState('')
  const [currentFilter, setFilter] = useState('SIGNED_BY_GOV')
  const [bills, setBills] = useState([]);

  useEffect(() => {
      const paginateBills = async() => {
        let offset = 1;
        let done = false;
        while (!done){
          const res = await fetch(`/api/v1/bills/2023/search?offset=${offset}`);
          const out = await res.json()
          await setBills((prevBills) => [...prevBills].concat(out.result.items.map(item => item.result)));
          offset = out.offsetEnd;
          if (out.offsetEnd >= out.total) done = true;
        }
      }
      paginateBills()
  }, []); // Only run on initial page load

  let filteredBills = bills.filter(x => {
    const currentlyInCommittee = x.status?.committeeName && x.status.committeeName.toLowerCase() === committee.toLowerCase()
    const wasInCommittee = () => {
      if (!x?.milestones?.items) return false;
      for (const status of x.milestones.items) {
        if (status.committeeName?.toLowerCase() === committee.toLowerCase()) return true
      }
      return false
    }

    const infilter = x.status.statusType === currentFilter
    const inSearch = (
      x.title.toLowerCase().includes(search.toLowerCase()) ||
      x.basePrintNo.toLowerCase().includes(search.toLowerCase()) || // S11, A29A, etc.
      x.sponsor?.member?.fullName.includes(search.toLowerCase())
    )
    return (
      infilter && inSearch && (
        !committee ||
        currentlyInCommittee ||
        wasInCommittee()
      )
    );
  }).slice(0, 500); // The user does not need to see 23,000 bills

  const filterByStatus = (status) => { return () => setFilter(status) };

  return (
    <div>
      <Header></Header>
      <div className="search">
        <Search setSearchText={setSearch}/>
        <CommitteeDropdown setCommittee={setCommittee} committee={committee}/>
      </div>
      <section className="content">
        <div className="table-head">DESCRIPTION</div>
        <div className="table-head">OVERALL STATUS</div>
        <div className="table-head">INTRODUCED</div>
        <div className="table-head" onClick={filterByStatus('IN_SENATE_COMM')}>IN COMMITTEE</div>
        <div className="table-head" onClick={filterByStatus('SENATE_FLOOR')}>ON FLOOR CALENDAR</div>
        <div className="table-head pass-two">
          <p className="header-senate-paragraph" onClick={filterByStatus('PASSED_SENATE')}>PASSED SENATE</p>
          <p className="header-assembly-paragraph" onClick={filterByStatus('PASSED_ASSEMBLY')}>PASSED ASSEMBLY</p>
        </div>
        <div className="table-head" onClick={filterByStatus('DELIVERED_TO_GOV')}>DELIVERED TO GOVERNOR</div>
        <div className="table-head" onClick={filterByStatus('SIGNED_BY_GOV')}>SIGNED BY GOVERNOR</div>
      </section>
      <div className="bill">
        {filteredBills.map((value, index) => {
          return <BillListItem key={index} billData={value} />;
        })}
      </div>
    </div>
  );
}
