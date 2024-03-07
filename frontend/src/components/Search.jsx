import PropTypes from 'prop-types';
import {useState} from 'react';
import './Search.css';

const Search = (props) => {
  const [search, setSearch] = useState('');

  const submit = (e) => {
    e.preventDefault();
    console.log('submitted');
    props.setSearchText(search);
  };

  return (
    <div className="search-bar">
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" onClick={submit}>Search</button>
      </form>
    </div>
  );
};
Search.propTypes = {
  setSearchText: PropTypes.func.isRequired,
};

export default Search;