import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import './LocForm.css';

const LocForm = ({ sponsorNames, billNo }) => {
  const [loading, setLoading] = useState(false);
  const [loc, setLoc] = useState('');
  const [placeName, setPlaceName] = useState('');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [representatives, setRepresentatives] = useState({});
  const [sponsorshipStatus, setSponsorshipStatus] = useState({});

  useEffect(() => {
    const sessionPlaceName = window.sessionStorage.getItem('placeName');
    if (sessionPlaceName) {
      setPlaceName(sessionPlaceName);
    }

    const sessionRepresentatives =
      window.sessionStorage.getItem('representatives');
    if (sessionRepresentatives) {
      const storedRepresentatives = JSON.parse(sessionRepresentatives);

      // Filter state-level representatives
      const stateRepresentatives = storedRepresentatives.filter(
        (rep) => rep.jurisdiction === 'state'
      );

      // Update sponsorship status
      const updatedSponsorshipStatus = {};
      stateRepresentatives.forEach((rep) => {
        updatedSponsorshipStatus[rep.name] = sponsorNames.includes(rep.name);
      });

      setRepresentatives(stateRepresentatives);
      setSponsorshipStatus(updatedSponsorshipStatus);
    }

    const sessionLatitude = window.sessionStorage.getItem('latitude');
    if (sessionLatitude) {
      setLatitude(JSON.parse(sessionLatitude));
    }

    const sessionLongitude = window.sessionStorage.getItem('longitude');
    if (sessionLongitude) {
      setLongitude(JSON.parse(sessionLongitude));
    }
  }, [sponsorNames]);

  const reset = () => {
    setLoc('');
    setPlaceName('');
    setLatitude('');
    setLongitude('');
    setRepresentatives([]);
    window.sessionStorage.setItem('placeName', '');
    window.sessionStorage.setItem('latitude', '');
    window.sessionStorage.setItem('longitude', '');
    window.sessionStorage.setItem('representatives', JSON.stringify({}));
    window.dispatchEvent(new StorageEvent('storage'));
  };

  const handleInputChange = (event) => {
    setLoc(event.target.value);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/geocoding/${loc}`);
      const data = await response.json();
      if (data.features[0]) {
        const coordinates = data.features[0].center;
        setLatitude(coordinates[1]);
        setLongitude(coordinates[0]);
        const repResponse = await fetch(
          `/api/v1/legislators/geo_search/offices/${coordinates[1]}/${coordinates[0]}`
        );
        const repData = await repResponse.json();

        const fetchedRepresentatives = repData.map((rep) => ({
          name: rep.name,
          title: rep.current_role.title,
          offices: rep.offices.map((office) => ({
            name: office.name.includes('District')
              ? office.address.slice(0, -6)
              : office.name,
            phone: office.voice,
          })),
          jurisdiction: rep.jurisdiction.classification,
        }));

        const sponsorshipStatus = {};
        fetchedRepresentatives.forEach((rep) => {
          sponsorshipStatus[rep.name] = sponsorNames.includes(rep.name);
        });
        setSponsorshipStatus(sponsorshipStatus);
        setRepresentatives(
          fetchedRepresentatives.filter((rep) => rep.jurisdiction === 'state')
        );
        window.sessionStorage.setItem(
          'representatives',
          JSON.stringify(fetchedRepresentatives)
        );
        window.sessionStorage.setItem(
          'latitude',
          JSON.stringify(coordinates[1])
        );
        window.sessionStorage.setItem(
          'longitude',
          JSON.stringify(coordinates[0])
        );
        const dataPlaceName =
          data.features[0].context[0].text +
          ', ' +
          data.features[0].context[1].text;
        console.log(dataPlaceName);
        if (dataPlaceName) {
          setPlaceName(dataPlaceName);
          window.sessionStorage.setItem('placeName', dataPlaceName);
        }
        window.dispatchEvent(new StorageEvent('storage'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  let content;

  const locationFound = Boolean(latitude && longitude);
  if (locationFound) {
    content = (
      <>
        Now displaying representatives for your District <b>{placeName}</b>.
        <br />
        <Button variant="text" className="change-location" onClick={reset}>
          Change location
        </Button>
        <div className="representatives">
          {/* eslint-disable-next-line no-unused-vars */}
          {Object.entries(representatives).map(([name, rep]) => (
            <div key={rep.name} className="representative">
              <h3>
                {rep.title} {rep.name}:{' '}
                <strong>
                  {sponsorshipStatus[rep.name]
                    ? 'Already a sponsor'
                    : 'NOT A SPONSOR'}
                </strong>
              </h3>
              <ul>
                {rep.offices.map((office, index) => (
                  <li key={index}>
                    <strong>Location:</strong> {office.name}
                    <br />
                    <strong>Phone:</strong>{' '}
                    <a href={'tel:' + office.phone}>{office.phone}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <h3>Script</h3>
        <div className="script">
          <p>
            Hi, my name is [NAME] and I'm a constituent from [CITY, ZIP]. I'm
            calling to demand [REP/SEN NAME] vote for {billNo}. Thank you for
            your time and consideration. IF LEAVING VOICEMAIL: Please leave your
            full street address to ensure your call is tallied.
          </p>
        </div>
      </>
    );
  } else {
    content = (
      <>
        You can personalize this page by displaying the list of representatives
        from your district.
        <i>(we do not store any data!)</i>
        <form onSubmit={handleFormSubmit}>
          <input
            id="autocomplete"
            placeholder="Enter your address or ZIP code"
            onChange={handleInputChange}
            value={loc}
          />
          <button type="submit" disabled={loading}>
            Submit
          </button>
        </form>
      </>
    );
  }

  return <div className="loc-form">{content}</div>;
};

LocForm.propTypes = {
  sponsorNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default LocForm;
