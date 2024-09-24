import './AboutPage.css';

import artMaking from '../../assets/artMaking.jpg';
import noPlanetB from '../../assets/noPlanetB.jpg';
import declareEmergency from '../../assets/declareEmergency.jpg';

// TODO validate final text
const blocks = [
  {
    question: "What is the NY State Legislative Tracker?",
    description: "The NY State Legislative Tracker is a tool designed to keep you informed about key legislative activities in New York State. We focus on selected bills that we, along with our partner organizations, think are important and need attention right now. Our tracker provides real-time updates and detailed information on these important bills, making it easier for you to stay engaged and involved in the legislative process.",
    image: noPlanetB,
  },
  {
    question: "How to use the NY State Legislative Tracker?",
    description: "We believe that citizen involvement is crucial to making a difference. Contacting your local representatives and letting them know your stance on these bills can put significant pressure on them to act. Your voice can help push important legislation forward. Don't underestimate the power of your participation! Reach out, make your opinions known, and help us make a change.",
    image: artMaking,
  },
  {
    question: "Who are we?",
    description: "Sunrise NYC’s digital tools team and legislative team are collaborating to pull together this NY State Legislative Tracker. We are dedicated to fighting against climate change and advocating for social justice. We want to make it easier for you to understand what’s going on in the state legislature and how you can get involved. Together, we can make sure our voices are heard and make a real impact on the laws that affect us all.",
    image: declareEmergency,
  }
];

function AboutPage() {
  return (
    <div id="about-page">
      <div id="about-page-header">
        <h2>
          About  the NY State Legislative Tracker
        </h2>
        <h3>
          We have put together this New York State Legislative Tracker to help you track and take action on progressive legislation.
        </h3>
      </div>
      {
        blocks.map(({ question, description, image }) => (
          <div className="about-page-block" key={question}>
            <div className="about-page-block-txt">
              <h4 className="about-page-block-question">{question}</h4>
              <span className="about-page-block-desc">{description}</span>
            </div>
            <img className="about-page-block-img" src={image} alt={question} />
          </div>
        ))
      }
    </div>
  );
}

export default AboutPage;