import { Icon } from '@iconify/react';
import { InputAdornment, TextField } from '@mui/material';
import PropTypes from 'prop-types';

const TextSearch = ({ value, updateValue }) => (
  <TextField
    id="sunrise-filter-search"
    label="Search"
    labelId="label-sunrise-filter-search"
    onChange={(e) => updateValue(e.target.value)}
    sx={{ height: '100%', fontSize: '1em' }}
    size="small"
    value={value}
    // Specify font size for both, so border is correct
    // https://stackoverflow.com/questions/50319847
    InputProps={{
      style: { fontSize: '1em' },
      // NOTE: adding start adornment causes label to exist above Select by default
      startAdornment: (
        <InputAdornment position="start">
          <Icon icon="material-symbols:search" />
        </InputAdornment>
      ),
    }}
    InputLabelProps={{ style: { fontSize: '1em' } }}
  />
);

TextSearch.propTypes = {
  value: PropTypes.string.isRequired,
  updateValue: PropTypes.func.isRequired,
};

export default TextSearch;
