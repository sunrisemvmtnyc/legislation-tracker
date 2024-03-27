import './CategoryTag.css';

const CategoryTag = ({ category }) => {
  const cssSuffix = category.toLowerCase().replace(/\s/g, '-');
  return (
    <span className={`category-tag category-tag-${cssSuffix}`}>
      {category}
    </span>
  );
};

export default CategoryTag;