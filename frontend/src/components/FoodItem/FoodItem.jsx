import { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import { getEffectivePrice } from "../../utils/price";

const FoodItem = ({
  id,
  name,
  price,
  discountPrice,
  description,
  image,
  inStock = true,
  isVeg = true,
  isBestseller = false,
  spiceLevel = "None",
  prepTimeMinutes,
  rating,
}) => {
  const { cartItems, addToCart, removeFromCart, url } = useContext(StoreContext);

  const effectivePrice = getEffectivePrice({ price, discountPrice });
  const hasDiscount = effectivePrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - effectivePrice) / price) * 100) : 0;

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img
          src={url + "/images/" + image}
          alt=""
          className={`food-item-image${inStock ? "" : " out-of-stock"}`}
        />
        <div className="food-item-badges">
          {isBestseller && <span className="food-item-badge bestseller">Bestseller</span>}
          {hasDiscount && <span className="food-item-badge discount">{discountPercent}% OFF</span>}
        </div>
        {!inStock ? (
          <div className="food-item-out-of-stock-badge">Out of Stock</div>
        ) : !cartItems[id] ? (
          <img
            className="add"
            onClick={() => addToCart(id)}
            src={assets.add_icon_white}
            alt=""
          />
        ) : (
          <div className="food-item-counter">
            <img onClick={()=>removeFromCart(id)} src={assets.remove_icon_red} alt="" />
            <p>{cartItems[id]}</p>
            <img onClick={()=>addToCart(id)} src={assets.add_icon_green} alt="" />
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p className="food-item-name">
            <span className={`veg-dot ${isVeg ? "veg" : "non-veg"}`} title={isVeg ? "Veg" : "Non-veg"} />
            {name}
          </p>
          {rating > 0 && (
            <span className="food-item-rating">
              <img src={assets.rating_starts} alt="" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="food-item-desc">{description}</p>
        <div className="food-item-meta">
          {prepTimeMinutes > 0 && <span className="food-item-chip">{prepTimeMinutes} min</span>}
          {spiceLevel !== "None" && <span className="food-item-chip spice">{spiceLevel}</span>}
        </div>
        <div className="food-item-price-row">
          <span className="food-item-price">${effectivePrice.toFixed(2)}</span>
          {hasDiscount && <span className="food-item-price-original">${price.toFixed(2)}</span>}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;
