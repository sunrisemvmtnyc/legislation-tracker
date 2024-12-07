import { Link } from 'react-router-dom';

import './Footer.css';

function Footer() {
  return (
    <div id="footer">
      <Link to="/" className="footer-title">
        <div className="footer-title">Sunrise NYC</div>
      </Link>
      <div className="footer-actions">
        <a
          className="footer-get-involved"
          href="https://sunrisenyc.org/"
          target="_blank"
          rel="noreferrer"
        >
          Get involved
        </a>
        <div className="footer-navbar">
          {/* <Link to="/learn">Learn</Link> */}
          <Link to="/advanced">Advanced view</Link>
          <Link to="/about">About</Link>
        </div>
      </div>
    </div>
  );
}

export default Footer;
