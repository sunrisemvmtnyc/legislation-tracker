import { useMemo } from 'react';
import { TextField, debounce } from '@mui/material';
import PropTypes from 'prop-types';

import { SEARCH_DEBOUNCE_TIME } from '../../constants';
import './TextSearch.css';

const TextSearch = ({ updateValue }) => {
  const handleChange = useMemo(
    () =>
      debounce((event) => {
        updateValue(event.target.value);
      }, SEARCH_DEBOUNCE_TIME),
    [updateValue]
  );

  return (
    <div className="text-field-container">
      <TextField id="text-field" label="Search" onChange={handleChange} />
    </div>
  );
};

TextSearch.propTypes = {
  updateValue: PropTypes.func.isRequired,
};

export default TextSearch;
