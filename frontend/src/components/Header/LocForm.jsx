import { useState } from "react";

const LocForm = () => {
  const [loc, setLoc] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const handleInputChange = (event) => {
    setLoc(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `/api/v1/geocoding/${loc}`
      );
      const data = await response.json();
      console.log(data.features[0]);
      if (data.features[0]) {
        const coordinates = data.features[0].center;
        console.log(coordinates);
        setLatitude(coordinates[1]);
        setLongitude(coordinates[0]);
        setCity(data.features[0].properties.city);
        setState(data.features[0].properties.state);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="header-rep-finder">
      <form onSubmit={handleFormSubmit}>
        <input
          id="autocomplete"
          placeholder="Enter your address or ZIP code"
          onChange={handleInputChange}
          value={loc}
        />
        <button type="submit">Submit</button>
        <div>
          {city && state && (
            <p>City: {city}, State: {state}</p>
          )}
          {latitude && longitude && (
            <p>Lat: {latitude}, Lon: {longitude}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LocForm;
