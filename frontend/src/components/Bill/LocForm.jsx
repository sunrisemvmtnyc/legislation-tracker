import { useState } from "react";
import Button from '@mui/material/Button';
import './LocForm.css';

const LocForm = () => {
  const [loading, setLoading] = useState(false);
  const [loc, setLoc] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [placeName, setPlaceName] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const reset = () => {
    setLoc("");
    setCity("");
    setState("");
    setPlaceName("");
    setLatitude("");
    setLongitude("");
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
        if (data.features[0].properties.city) {
          setCity(data.features[0].properties.city);
        }
        if (data.features[0].properties.state) {
          setState(data.features[0].properties.city);
        }
        if (data.features[0].place_name) {
          setPlaceName(data.features[0].place_name);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  let content;

  const locationFound = Boolean(latitude && longitude);
  if (locationFound) {
    const locationToDisplay = city && state
      ? `City: ${city}, State: ${state}`
      : placeName
        ? placeName
        : `Lat: ${latitude}, Lon: ${longitude}`;

    content = (
      <>
        Now displaying sponsors related to <b>{locationToDisplay}</b>.
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
