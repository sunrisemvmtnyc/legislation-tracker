import { useState } from "react";
import { Select, MenuItem } from "@mui/material";

import "./Dropdown.css";

const Dropdown = ({ id, label, options }) => {
  const [selected, setSelected] = useState([]);

  const updateSelected = (event) => {
    setSelected(event.target.value);
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
        {options.map((option) => (
          <MenuItem className="dropdown-option" value={option} key={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default Dropdown;
