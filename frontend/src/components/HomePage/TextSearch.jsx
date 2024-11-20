import { Icon } from '@iconify/react';
import { useMemo } from 'react';
import { InputAdornment, TextField, debounce } from '@mui/material';
import PropTypes from 'prop-types';

import { SEARCH_DEBOUNCE_TIME } from '../../constants';

const TextSearch = ({ updateValue }) => {
  const handleChange = useMemo(
    () =>
      debounce((event) => {
        updateValue(event.target.value);
      }, SEARCH_DEBOUNCE_TIME),
    [updateValue]
  );

  return (
    <TextField
      id="sunrise-filter-search"
      label="Search"
      labelId="label-sunrise-filter-search"
      onChange={handleChange}
      sx={{ height: '100%', fontSize: '1em' }}
      size="small"
      // Specify font size for both, so border is correct
      // https://stackoverflow.com/questions/50319847
      InputProps={{
        style: { fontSize: '1em' },
        startAdornment: (
          <InputAdornment position="start">
            <Icon icon="material-symbols:search" />
          </InputAdornment>
        ),
      }}
      InputLabelProps={{ style: { fontSize: '1em' } }}
    />
  );
};

TextSearch.propTypes = {
  updateValue: PropTypes.func.isRequired,
};

export default TextSearch;
