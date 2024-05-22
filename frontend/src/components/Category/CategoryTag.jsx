import './CategoryTag.css';

const CategoryTag = ({ category }) => {
  const { long_name, short_name, color } = category;
  return (
    <span
    className={`category-tag`}
    style={{ background: color }}
    title={long_name} // TODO make a better tooltip
    >
      {short_name}
    </span>
  );
};

export default CategoryTag;
