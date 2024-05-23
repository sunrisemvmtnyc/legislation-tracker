import './AboutPage.css';

// TODO validate final text
const blocks = [
  {
    title: "our goal",
    question: "What is the NY State Legislative Tracker?",
    descripton: "The NY State Legislative Tracker is a tool designed to keep you informed about key legislative activities in New York State. We focus on selected bills that we, along with our partner organizations, think are important and need attention right now. Our tracker provides real-time updates and detailed information on these important bills, making it easier for you to stay engaged and involved in the legislative process.",
  },
  {
    title: "use solution",
    question: "How to use the NY State Legislative Tracker?",
    descripton: "We believe that citizen involvement is crucial to making a difference. Contacting your local representatives and letting them know your stance on these bills can put significant pressure on them to act. Your voice can help push important legislation forward. Don't underestimate the power of your participation! Reach out, make your opinions known, and help us make a change.",
  },
  {
    title: "about us",
    question: "Who are we?",
    descripton: "Sunrise NYC’s digital tools team and legislative team are collaborating to pull together this NY State Legislative Tracker. We are dedicated to fighting against climate change and advocating for social justice. We want to make it easier for you to understand what’s going on in the state legislature and how you can get involved. Together, we can make sure our voices are heard and make a real impact on the laws that affect us all.",
  }
];

function AboutPage() {
  return (
    <div id="about-page">
      {
        blocks.map(({ title, question, descripton }) => (
          <div class="about-page-block">
            <span className="about-page-block-title">{title}</span>
            <span className="about-page-block-question">{question}</span>
            <span className="about-page-block-desc" dangerouslySetInnerHTML={{__html: descripton}} />
          </div>
        ))
      }
    </div>
  );
}

export default AboutPage;