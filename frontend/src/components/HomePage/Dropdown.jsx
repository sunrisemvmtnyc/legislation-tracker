import { useState } from 'react';
import PropTypes from 'prop-types';
import { Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const Dropdown = ({ id, label, options, updateFilter }) => {
  const [selected, setSelected] = useState([]);

  const updateSelected = (event) => {
    setSelected(event.target.value);
    updateFilter(event.target.value);
  };

  return (
    <FormControl sx={{ minWidth: 160, fontSize: '1em' }} size="small" key={id}>
      <InputLabel id={`sunrise-filter-${id}`} sx={{ fontSize: '1em' }}>
        {label}
      </InputLabel>
      <Select
        id={id}
        multiple
        sx={{ fontSize: '1em' }}
        labelId={`sunrise-filter-${id}`}
        value={selected}
        onChange={updateSelected}
        label={label}
      >
        {options.map(({ displayName, value }) => (
          <MenuItem
            className="dropdown-option"
            value={value}
            key={value}
            sx={{ fontSize: '1em' }}
          >
            {displayName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

Dropdown.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      displayName: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  updateFilter: PropTypes.func,
};

export default Dropdown;
