import { TAGS, BILL_STATUSES } from "../../constants";
import Dropdown from "./Dropdown";
import "./Filters.css";

const Options = ({ options }) =>
  options.map((option) => (
    <option key={option} value={option}>
      {option}
    </option>
  ));

const Filters = () => (
  <div className="filters-bar">
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
  </div>
);

export default Filters;
