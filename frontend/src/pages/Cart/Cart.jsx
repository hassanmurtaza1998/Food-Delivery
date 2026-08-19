import { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { getEffectivePrice } from "../../utils/price";

const DELIVERY_FEE = 2;

const Cart = () => {
  const {
    food_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getDiscountAmount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    url
  } = useContext(StoreContext);

  const navigate=useNavigate();
  const [promoInput, setPromoInput] = useState("");

  const subtotal = getTotalCartAmount();
  const discount = getDiscountAmount();
  const total = subtotal === 0 ? 0 : Math.max(subtotal - discount + DELIVERY_FEE, 0);

  const onApplyPromo = (event) => {
    event.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput.trim());
    }
  };

  const isCartEmpty = Object.values(cartItems).every((qty) => !qty || qty <= 0);

  if (isCartEmpty) {
    return (
      <div className="cart">
        <div className="cart-empty">
          <p className="cart-empty-title">Your cart is empty</p>
          <p className="cart-empty-text">Looks like you haven&apos;t added anything yet.</p>
          <button onClick={() => navigate("/")}>Browse the Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          if (cartItems[item._id] > 0) {
            const effectivePrice = getEffectivePrice(item);
            return (
              <div key={item._id}>
                <div className="cart-items-title cart-items-item">
                  <img src={url+"/images/"+item.image} alt="" />
                  <p>{item.name}</p>
                  <p>${effectivePrice.toFixed(2)}</p>
                  <p className="cart-items-quantity">
                    <span onClick={() => removeFromCart(item._id)} className="cart-qty-btn">-</span>
                    {cartItems[item._id]}
                    <span onClick={() => addToCart(item._id)} className="cart-qty-btn">+</span>
                  </p>
                  <p>${(effectivePrice * cartItems[item._id]).toFixed(2)}</p>
                  <p onClick={() => removeFromCart(item._id, true)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
          return null;
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotals</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <hr />
            {appliedPromo && (
              <>
                <div className="cart-total-details">
                  <p>Discount ({appliedPromo.code})</p>
                  <p>-${discount.toFixed(2)}</p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${subtotal===0?"0.00":DELIVERY_FEE.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${total.toFixed(2)}</b>
            </div>
          </div>
          <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promocode, Enter it here</p>
            <form className="cart-promocode-input" onSubmit={onApplyPromo}>
              <input
                type="text"
                placeholder="promo code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button type="submit">Submit</button>
            </form>
            {appliedPromo && (
              <p className="cart-promocode-applied">
                Applied: {appliedPromo.code} ({appliedPromo.discountPercent}% off){" "}
                <span onClick={removePromoCode} className="cart-promocode-remove">Remove</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
