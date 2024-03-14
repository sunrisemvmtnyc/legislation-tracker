import CategoryTag from "../Category/CategoryTag";

const Card = ({ bill }) => (
  <a className='home-bill-card' href={`/bill/${bill.session}/${bill.printNo}`}>
    <div className="category-tags">
    {bill.categories && bill.categories.map((category) => (
      <div className='home-bill-categories' key={category}>
        <CategoryTag category={category} />
      </div>
    ))}
    </div>
    <div>{bill.title}</div>
    {!!bill.status.statusDesc && <div> Status: <b>{bill.status.statusDesc}</b></div>}
  </a>
);

export default Card;
