import { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom'

const DELIVERY_FEE = 2;

const PlaceOrder = () => {
  const navigate= useNavigate();

  const { getTotalCartAmount, getDiscountAmount, appliedPromo, token, food_list, cartItems } =
    useContext(StoreContext);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const subtotal = getTotalCartAmount();
  const discount = getDiscountAmount();
  const total = subtotal === 0 ? 0 : Math.max(subtotal - discount + DELIVERY_FEE, 0);

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    const orderItems = [];
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ _id: item._id, name: item.name, quantity: cartItems[item._id] });
      }
    });
    const orderData = {
      address: data,
      items: orderItems,
      promoCode: appliedPromo?.code,
    };

    setSubmitting(true);
    try {
      const response = await api.post("/api/order/place", orderData);
      if (response.data.success) {
        const {session_url}=response.data;
        window.location.replace(session_url);
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      // network/5xx errors are surfaced globally by the api interceptor
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(()=>{
    if(!token){
      toast.error("Please Login first")
      navigate("/cart")
    }
    else if(subtotal===0){
      toast.error("Please Add Items to Cart");
      navigate("/cart")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[token])
  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            required
            name="firstName"
            value={data.firstName}
            onChange={onChangeHandler}
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            value={data.lastName}
            onChange={onChangeHandler}
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Email Address"
        />
        <input
          required
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street"
        />
        <div className="multi-fields">
          <input
            required
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            type="text"
            placeholder="State"
          />
        </div>
        <div className="multi-fields">
          <input
            required
            name="zipcode"
            value={data.zipcode}
            onChange={onChangeHandler}
            type="text"
            placeholder="Zip Code"
          />
          <input
            required
            name="country"
            value={data.country}
            onChange={onChangeHandler}
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          type="tel"
          placeholder="Phone"
        />
      </div>
      <div className="place-order-right">
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
              <p>${subtotal === 0 ? "0.00" : DELIVERY_FEE.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${total.toFixed(2)}</b>
            </div>
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? "REDIRECTING..." : "PROCEED TO PAYMENT"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
