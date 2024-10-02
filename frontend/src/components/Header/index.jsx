import { Link } from 'react-router-dom';

import './Header.css';
import sunriseImage from '../../assets/sunrisenyc.png';

function Header() {
  return (
    <div className="header-container">
      <Link to="/" className="header-title">
        <img src={sunriseImage} alt="Sunrise logo" height="90px" width="90px" />
        <div>NY State&nbsp;&nbsp;legislative tracker</div>
      </Link>
      <div className="header-navbar">
        {/* <Link to="/learn">Learn</Link> */}
        <Link to="/advanced">Advanced view</Link>
        <Link to="/about">About</Link>
        <a
          className="header-get-involved"
          href="https://sunrisenyc.org/get-involved"
          target="_blank"
          rel="noreferrer"
        >
          Get involved
        </a>
      </div>
    </div>
  );
}

export default Header;
