import { Link } from "react-router-dom";

import "./Footer.css";
import sunriseImage from "../../assets/sunrisenyc.png";

function Footer() {
  return (
    <div id='footer'>
      <Link to="/" className="footer-title">
        <img src={sunriseImage} alt="Sunrise NYC logo" />
        <div className="footer-title">Sunrise NYC</div>
      </Link>
      <div className="footer-actions">
        <a className="footer-get-involved" href="https://sunrisenyc.org/" target="_blank" rel="noreferrer">Get involved</a>
        <div className="footer-navbar">
          <Link to="/learn">Learn</Link>
          <Link to="/advanced">Advanced view</Link>
          <Link to="/about">About</Link>
        </div>
      </div>
    </div>
  );
}

export default Footer;
