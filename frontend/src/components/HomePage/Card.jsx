import { useMemo } from 'react';

import CategoryTag from "../Category/CategoryTag";
import { TAGS } from '../../constants';

// TODO replace with actual categories when available
function generateRandomTags() {
  const tags = TAGS.slice();
  const numTags = Math.floor(Math.random() * 2) + 1; // Generates either 1 or 2
  const randomTags = [];

  for (let i = 0; i < numTags; i++) {
    const randomIndex = Math.floor(Math.random() * tags.length);
    randomTags.push(tags[randomIndex]);
    tags.splice(randomIndex, 1); // Remove selected tag to avoid duplication
  }

  return randomTags;
}

const Card = ({ bill }) => {
  const categories = useMemo(() => generateRandomTags(), [bill.basePrintNoStr]);

  return (
    <a className='home-bill-card' href={`/bill/${bill.session}/${bill.printNo}`} >
      {
        !!categories?.length && (
          <div className='home-bill-categories'>
            {
              categories.map(category => <CategoryTag category={category} key={category} />)
            }
          </div>
        )
      }
      <div>{bill.title}</div>
      {!!bill.status.statusDesc && <div > Status: <b>{bill.status.statusDesc}</b></div>}
    </a>
  );
};

export default Card;
