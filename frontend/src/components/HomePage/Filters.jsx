import { FormControl } from '@mui/material';

import { TAGS, BILL_STATUSES } from "../../constants";
import Dropdown from "./Dropdown";
import "./Filters.css";

const Filters = () => (
  <FormControl className="filters-bar" fullWidth>
    <Dropdown
      id="legislator-select"
      label="Legislator Name"
      options={["Alex", "Bo", "Carly"]}
    />
    <Dropdown
      id="status-select"
      label="Bill Status"
      options={Object.values(BILL_STATUSES)}
    />
    <Dropdown
      id="category-select"
      label="Bill Category"
      options={TAGS}
    />
  </FormControl>
);

export default Filters;
