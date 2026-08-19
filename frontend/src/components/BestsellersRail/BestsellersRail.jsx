import { useContext } from "react";
import "./BestsellersRail.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import Reveal from "../Reveal/Reveal";

const BestsellersRail = () => {
  const { food_list, loadingFoodList } = useContext(StoreContext);
  const items = food_list.filter((item) => item.isBestseller);

  if (!loadingFoodList && items.length === 0) return null;

  return (
    <div className="bestsellers-rail">
      <Reveal as="h2">Bestsellers near you</Reveal>
      <div className="bestsellers-rail-list">
        {items.map((item, index) => (
          <div className="bestsellers-rail-item" key={item._id}>
            <Reveal delay={index * 60}>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestsellersRail;
