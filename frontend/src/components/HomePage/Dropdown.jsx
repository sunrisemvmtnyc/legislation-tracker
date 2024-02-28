import { useState } from "react";
import { InputLabel, Select, MenuItem } from "@mui/material";

// TODO: use MUI multiple select
// TODO: styles
const Dropdown = ({ id, label, options }) => {
  const [selected, setSelected] = useState([]);

  const updateSelected = (event) => {
    setSelected(event.target.value);
  };

  return (
    <div className="dropdown">
      <InputLabel htmlFor={id} className="dropdown-label">
        {label}
      </InputLabel>
      <Select
        id={id}
        className="dropdown-options"
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
