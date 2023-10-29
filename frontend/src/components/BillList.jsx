import React, { useState, useEffect } from 'react';

import BillListItem from './BillListItem';
import Header from './Header';
import Search from './Search';
import CommitteeDropdown from './CommitteeDropdown';
import './BillList.css'

import { BILL_STATUS } from '../utils/billUtils';

export default function BillList() {
  const [search, setSearch] = useState('');
  const [committee, setCommittee] = useState('')
  const [currentFilter, setFilter] = useState(BILL_STATUS.signed)
  const [bills, setBills] = useState([]);

  useEffect(() => {
      const paginateBills = async() => {
        let start = 0
        do {
          const res = await fetch(`/api/v1/bills/2023?start=${start}`);
          const {bills, end} = await res.json();
          await setBills((prevBills) => [...prevBills].concat(bills));
          start = end
        } while (start > 0)
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
  }).slice(0, 500); // The user does not need to see 23,000 bills // TODO should the backend do the filter?

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
        <div className="table-head two-lines">
          <p onClick={filterByStatus(BILL_STATUS.inSenateComm)}>IN SENATE COMMITTEE</p>
          <p onClick={filterByStatus(BILL_STATUS.inAssemblyComm)}>IN ASSEMBLY COMMITTEE</p>
        </div>
        <div className="table-head two-lines">
          <p onClick={filterByStatus(BILL_STATUS.senateFloor)}>ON SENATE FLOOR CALENDAR</p>
          <p onClick={filterByStatus(BILL_STATUS.assemblyFloor)}>ON ASSEMBLY FLOOR CALENDAR</p>
        </div>
        <div className="table-head two-lines">
          <p onClick={filterByStatus(BILL_STATUS.passedSenate)}>PASSED SENATE</p>
          <p onClick={filterByStatus(BILL_STATUS.passedAssembly)}>PASSED ASSEMBLY</p>
        </div>
        <div className="table-head" onClick={filterByStatus(BILL_STATUS.delivered)}>DELIVERED TO GOVERNOR</div>
        <div className="table-head" onClick={filterByStatus(BILL_STATUS.signed)}>SIGNED BY GOVERNOR</div>
      </section>
      <div className="bill">
        {filteredBills.map((value, index) => {
          return <BillListItem key={index} billData={value} />;
        })}
      </div>
    </div>
  );
}
