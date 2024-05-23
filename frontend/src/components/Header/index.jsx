import { Link } from "react-router-dom";

import "./Header.css";
import sunriseImage from "../../assets/logo-sunrise-movement-black-300x86.png";

function Header() {
  return (
    <div className="header-container">
      <Link to="/" className="header-title">
        <img src={sunriseImage} alt="Sunrise logo" />
        <div>
          NY state<br />legislative tracker
        </div>
      </Link>
      <div className="header-actions">
        <a className="header-get-involved" href="https://sunrisenyc.org/get-involved" target="_blank" rel="noreferrer">Get involved</a>
        <div className="header-navbar">
          {/* <Link to="/learn">Learn</Link> */}
          <Link to="/advanced">Advanced view</Link>
          <Link to="/about">About</Link>
        </div>
      </div>
    </div>
  );
}

export default Header;