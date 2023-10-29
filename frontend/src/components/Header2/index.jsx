import Stack from "@mui/material/Stack";
import { Link } from "react-router-dom";
import "./Header.css";
import sunriseImage from "./sunrisenyc.png";

function Header2() {
  return (
    <Stack
      alignItems="center"
      direction="row"
      justifyContent="space-between"
      className="headerContainer"
    >
      <Stack direction="row">
        <img className="logo" src={sunriseImage} alt="Sunrise logo" />
        <Link to="/" className="headerTitle">
          Sunrise Legislative Tracker
        </Link>
      </Stack>
      <Stack direction="row" spacing={3} alignItems="center" className="navbar">
        <Link to="/tracker">Tracker</Link>
        <Link to="/status">Status</Link>
        <Link to="/politicians">Politicians</Link>
      </Stack>
    </Stack>
  );
}

export default Header2;
