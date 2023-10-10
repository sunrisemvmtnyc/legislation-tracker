import React from 'react';
import Select from 'react-select';

import ChevronDown from './chevron-down';


const committees = [
  "All",
  "Administrative Regulations Review Commission (ARRC)",
  "Aging",
  "Agriculture",
  "Alcoholism and Substance Abuse",
  "Banks",
  "Budget and Revenue",
  "Children and Families",
  "Cities 1",
  "Cities 2",
  "Civil Service and Pensions",
  "Codes",
  "Commerce, Economic Development and Small Business",
  "Consumer Protection",
  "Corporations, Authorities and Commissions",
  "Crime Victims, Crime and Correction",
  "Cultural Affairs, Tourism, Parks and Recreation",
  "Disabilities",
  "Domestic Animal Welfare",
  "Education",
  "Elections",
  "Energy and Telecommunications",
  "Environmental Conservation",
  "Ethics and Internal Governance",
  "Finance",
  "Health",
  "Higher Education",
  "Housing, Construction and Community Development",
  "Insurance",
  "Internet and Technology",
  "Investigations and Government Operations",
  "Judiciary",
  "Labor",
  "Legislative Commission on Rural Resources",
  "Libraries",
  "Local Government",
  "Mental Health",
  "New York City Education",
  "Procurement and Contracts",
  "Racing, Gaming and Wagering",
  "Rules",
  "Social Services",
  "State-Native American Relations",
  "The New York State Black, Puerto Rican, Hispanic and Asian Legislative Caucus",
  "Transportation",
  "Veterans, Homeland Security and Military Affairs",
  "Women's Issues",
]

const CommitteeDropdown = ({committee, setCommittee}) => {
  return (
    <Select
      onChange={(option) => setCommittee(option.value == "All" ? "" : option.value)}
      options={committees.map(c => ({value: c, label: c}))}
      placeholder="Filter bills by committee"
      // menuIsOpen={true} // useful for debugging
      styles={{
        container: (base) => ({...base, flex: "1 1 auto", maxWidth: "40%"}),
        control: (base) => ({...base, border: "3px solid #000", borderRadius: 0, height: "5rem"}),
        menu: (base) => ({...base, margin: 0}),
        menuList: (base) => ({...base, scrollbarWidth: "none", borderRight: "3px solid #000", borderBottom: "3px solid #000", borderLeft: "3px solid #000", borderRadius: 0}),
      }}
      components={{
        DropdownIndicator: ({ innerRef }) => (
          <ChevronDown ref={innerRef} style={{fill: "none"}} size={30}/>
        ),
        IndicatorSeparator: ({ innerRef }) => <div className="custom-sep" ref={innerRef}></div>,
      }}
    />
  )
}
export default CommitteeDropdown;
