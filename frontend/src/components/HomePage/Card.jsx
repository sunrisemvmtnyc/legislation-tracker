import CategoryTag from "../Category/CategoryTag";

const Card = ({ bill, category }) => (
  <a className='home-bill-card' href={`/bill/${bill.session}/${bill.printNo}`} >
    {
      !!category && (
        <div className='home-bill-categories'>
          <CategoryTag category={category} key={category} />
        </div>
      )
    }
    <div>{bill.title}</div>
    {!!bill.status.statusDesc && <div > Status: <b>{bill.status.statusDesc}</b></div>}
  </a>
);

export default Card;
