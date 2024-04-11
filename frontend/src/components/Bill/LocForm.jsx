import { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import './LocForm.css';

const LocForm = () => {
  const [loading, setLoading] = useState(false);
  const [loc, setLoc] = useState("");
  const [placeName, setPlaceName] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    const sessionPlaceName = window.sessionStorage.getItem("placeName");
    if (sessionPlaceName) {
      setPlaceName(sessionPlaceName);
    }
    const sessionLatitude = window.sessionStorage.getItem("latitude");
    if (sessionLatitude) {
      setLatitude(JSON.parse(sessionLatitude));
    }
    const sessionLongitude = window.sessionStorage.getItem("longitude");
    if (sessionLongitude) {
      setLongitude(JSON.parse(sessionLongitude));
    }
  }, []);

  const reset = () => {
    setLoc("");
    setPlaceName("");
    setLatitude("");
    setLongitude("");
    window.sessionStorage.setItem("placeName", "");
    window.sessionStorage.setItem("latitude", "");
    window.sessionStorage.setItem("longitude","");
    window.dispatchEvent(new StorageEvent('storage'));
  };

  const handleInputChange = (event) => {
    setLoc(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/geocoding/${loc}`
      );
      const data = await response.json();
      if (data.features[0]) {
        const coordinates = data.features[0].center;
        setLatitude(coordinates[1]);
        setLongitude(coordinates[0]);
        window.sessionStorage.setItem("latitude", JSON.stringify(coordinates[1]));
        window.sessionStorage.setItem("longitude", JSON.stringify(coordinates[0]));
        const dataPlaceName = data.features[0].place_name;
        if (dataPlaceName) {
          setPlaceName(dataPlaceName);
          window.sessionStorage.setItem("placeName", dataPlaceName);
        }
        window.dispatchEvent(new StorageEvent('storage'));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  let content;

  const locationFound = Boolean(latitude && longitude);
  if (locationFound) {
    content = (
      <>
        Now displaying sponsors related to <b>{placeName}</b>.
        <br />
        <Button variant="text" className="change-location" onClick={reset}>Change location</Button>
      </>
    );
  } else {
    content = (
      <>
        You can personalize this page by displaying the list of representatives from your district.
        <i>(we do not store any data!)</i>
        <form onSubmit={handleFormSubmit}>
          <input
            id="autocomplete"
            placeholder="Enter your address or ZIP code"
            onChange={handleInputChange}
            value={loc}
          />
          <button type="submit" disabled={loading}>Submit</button>
        </form>
      </>
    );
  }

  return (
    <div className="loc-form">
      {content}
    </div>
  )
};

export default LocForm;