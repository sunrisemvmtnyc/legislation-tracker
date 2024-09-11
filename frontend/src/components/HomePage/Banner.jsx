import oneWorldImage from '../../assets/one_world.png';

const Banner = () => (
  <div id="home-banner">
    <div className="home-banner-title">
      <span>
        We have put together this <b>New York State Legislative Tracker</b> to
        help you track and take action on progressive legislation.
      </span>
    </div>
    <div className="home-banner-lower-row">
      <img
        className="home-banner-image"
        src={oneWorldImage}
        alt="Image of rally poster with Earth and the words, 'One World'"
      />
      <div className="home-banner-desc">
        <b>What can you do on this website?</b>
        <ul>
          <li>Search for the most important bills taking place right now</li>
          <li>See the sponsors</li>
          <li>Find how you can get involved</li>
        </ul>
      </div>
    </div>
  </div>
);

export default Banner;
