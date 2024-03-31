import { useState } from "react";
import PropTypes from 'prop-types';
import { Select, MenuItem } from "@mui/material";

import "./Dropdown.css";

const Dropdown = ({ id, label, options, updateFilter }) => {
  const [selected, setSelected] = useState([]);

  const updateSelected = (event) => {
    setSelected(event.target.value);
    updateFilter(event.target.value);
  };

  return (
    <div className="dropdown">
      <label htmlFor={id} className="dropdown-label">
        {label}
      </label>
      <Select
        className="dropdown-options"
        id={id}
        multiple
        value={selected}
        onChange={updateSelected}
      >
        {options.map(({ displayName, value }) => (
          <MenuItem className="dropdown-option" value={value} key={value}>
            {displayName}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string,
    value: PropTypes.string,
  })),
  updateFilter: PropTypes.func,
};

export default Dropdown;
