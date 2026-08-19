import { useContext, useState } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import Reveal from "../Reveal/Reveal";
import useDebounce from "../../hooks/useDebounce";

const SKELETON_COUNT = 8;
const STAGGER_STEP = 60;
const STAGGER_CAP = 8;

const renderFoodItem = (item, index = 0) => (
  <Reveal key={item._id} delay={(index % STAGGER_CAP) * STAGGER_STEP}>
    <FoodItem
      id={item._id}
      name={item.name}
      description={item.description}
      price={item.price}
      discountPrice={item.discountPrice}
      image={item.image}
      inStock={item.inStock}
      isVeg={item.isVeg}
      isBestseller={item.isBestseller}
      spiceLevel={item.spiceLevel}
      prepTimeMinutes={item.prepTimeMinutes}
      rating={item.rating}
    />
  </Reveal>
);

const FoodDisplay = ({ category }) => {
  const { food_list, loadingFoodList, search } = useContext(StoreContext);
  const [vegOnly, setVegOnly] = useState(false);
  const debouncedSearch = useDebounce(search, 250);
  const query = debouncedSearch.trim().toLowerCase();
  const isFiltered = category !== "All";

  const categoryItems = food_list.filter((item) => category === "All" || category === item.category);
  const visibleItems = categoryItems.filter((item) => {
    const matchesSearch = !query || item.name.toLowerCase().includes(query);
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesSearch && matchesVeg;
  });

  const mostOrdered = isFiltered ? categoryItems.filter((item) => item.isBestseller) : [];
  const deals = isFiltered
    ? categoryItems.filter((item) => item.discountPrice && item.discountPrice < item.price)
    : [];

  return (
    <div className="food-display" id="food-display">
      {!loadingFoodList && mostOrdered.length > 0 && (
        <div className="food-display-subsection">
          <Reveal as="h3">Most ordered in {category}</Reveal>
          <div className="food-display-rail">
            {mostOrdered.map((item, index) => (
              <div className="food-display-rail-item" key={item._id}>
                {renderFoodItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loadingFoodList && deals.length > 0 && (
        <div className="food-display-subsection">
          <Reveal as="h3">Deals in {category}</Reveal>
          <div className="food-display-rail">
            {deals.map((item, index) => (
              <div className="food-display-rail-item" key={item._id}>
                {renderFoodItem(item, index)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="food-display-header">
        <h2>{isFiltered ? `All ${category}` : "Top dishes near you"}</h2>
        {food_list.length > 0 && (
          <label className="food-display-veg-toggle">
            <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
            <span className="veg-dot veg" />
            Veg only
          </label>
        )}
      </div>
      <div className="food-display-list">
        {loadingFoodList
          ? Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <div className="food-item-skeleton" key={index}>
                <div className="food-item-skeleton-img shimmer" />
                <div className="food-item-skeleton-line shimmer" style={{ width: "70%" }} />
                <div className="food-item-skeleton-line shimmer" style={{ width: "40%" }} />
              </div>
            ))
          : visibleItems.map((item, index) => renderFoodItem(item, index))}
        {!loadingFoodList && visibleItems.length === 0 && (
          <div className="food-display-empty">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7l1-3h14l1 3M4 7h16M4 7v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M9 11a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="food-display-empty-title">
              {food_list.length === 0 ? "Our menu is being prepared" : "No dishes match your search"}
            </p>
            <p className="food-display-empty-text">
              {food_list.length === 0
                ? "Check back soon — we're putting the finishing touches on it."
                : "Try a different search term or category."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDisplay;
