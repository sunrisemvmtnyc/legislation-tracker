import "./Header.css";
import Icons from "./icons.svg";

const Header = () => {
    return (
      <section className="site-header">
        <div className="site-header__title">
          <svg className="icon project__icon">
            <use xlinkHref={`${Icons}#icon--bill`} />
          </svg>
          <h1 className="site-header__text">
            New York State Bill Tracker
          </h1>
        </div>
      </section>
    );
}
export default Header;