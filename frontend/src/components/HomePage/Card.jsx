import CategoryTag from '../Category/CategoryTag';

const Card = ({ bill, billCategoryMappings, allCategories }) => {
  let categories = [];
  if (billCategoryMappings && allCategories) {
    categories = billCategoryMappings
      .map((abrv) => allCategories[abrv])
  }
  return (
    <a
      className="home-bill-card"
      href={`/bill/${bill.session}/${bill.printNo}`}
    >
      {!!categories.length && (
        <div className="home-bill-categories">
          {categories.map((category) => (
            <CategoryTag category={category} key={category.id} />
          ))}
        </div>
      )}
      <div>{bill.title}</div>
      {!!bill.status.statusDesc && (
        <div>
          {' '}
          Status: <b>{bill.status.statusDesc}</b>
        </div>
      )}
    </a>
  );
};

export default Card;
