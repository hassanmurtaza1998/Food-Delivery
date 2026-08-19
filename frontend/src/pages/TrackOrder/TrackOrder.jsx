import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TrackOrder.css";
import api, { BACKEND_URL } from "../../utils/api";
import { StoreContext } from "../../context/StoreContext";
import OrderList from "../../components/OrderList/OrderList";
import { toast } from "react-toastify";

const STEPS = ["Food Processing", "Out for delivery", "Delivered"];
const TRACKING_ID_PATTERN = /^TMT-[A-Z0-9]{10}$/i;

const TrackOrder = () => {
  const { trackingId: trackingIdParam } = useParams();
  const { token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [input, setInput] = useState(trackingIdParam || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(!token);

  const lookup = async (id) => {
    const trimmed = id.trim().toUpperCase();
    if (!TRACKING_ID_PATTERN.test(trimmed)) {
      toast.error("That doesn't look like a valid tracking ID (e.g. TMT-AB12CD34EF)");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const response = await api.get(`/api/order/track/${encodeURIComponent(trimmed)}`);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setOrder(null);
        toast.error(response.data.message);
      }
    } catch (error) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingIdParam) {
      lookup(trackingIdParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingIdParam]);

  const onSubmit = (event) => {
    event.preventDefault();
    navigate(`/track/${input.trim().toUpperCase()}`);
  };

  const currentStepIndex = order ? STEPS.indexOf(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";

  // Signed-in users land on their full order history by default — no need
  // to hunt down a tracking ID just to see orders they placed themselves.
  const showOwnOrders = token && !trackingIdParam;

  return (
    <div className={`track-order${showOwnOrders ? " track-order-wide" : ""}`}>
      <div className="track-order-hero">
        <h1>{showOwnOrders ? "Your Orders" : "Track Your Order"}</h1>
        {!showOwnOrders && (
          <p>Enter the tracking ID from your order confirmation email to see live status.</p>
        )}

        {showOwnOrders && !showManualSearch && (
          <button type="button" className="track-order-link-btn" onClick={() => setShowManualSearch(true)}>
            Have a tracking ID for another order? Look it up here
          </button>
        )}

        {(!showOwnOrders || showManualSearch) && (
          <form className="track-order-form" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="e.g. TMT-AB12CD34EF"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>{loading ? "Searching..." : "Track"}</button>
          </form>
        )}
      </div>

      {showOwnOrders ? (
        <OrderList />
      ) : (
        <>
          {loading && <p className="track-order-status-text">Looking up your order...</p>}

          {!loading && searched && !order && (
            <div className="track-order-empty">
              <p className="track-order-empty-title">We couldn&apos;t find that order</p>
              <p>Double-check the tracking ID and try again.</p>
            </div>
          )}

          {!loading && order && (
            <div className="track-order-result">
              <div className="track-order-summary">
                <div>
                  <p className="track-order-label">Tracking ID</p>
                  <p className="track-order-value">{order.trackingId}</p>
                </div>
                <div>
                  <p className="track-order-label">Placed on</p>
                  <p className="track-order-value">{new Date(order.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="track-order-label">Total</p>
                  <p className="track-order-value">${order.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="track-order-label">Payment</p>
                  <p className={`track-order-value ${order.payment ? "paid" : "unpaid"}`}>
                    {order.payment ? "Paid" : "Unpaid"}
                  </p>
                </div>
              </div>

              {isCancelled ? (
                <div className="track-order-cancelled">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p>This order was cancelled.</p>
                </div>
              ) : (
                <div className="track-order-stepper">
                  {STEPS.map((step, index) => {
                    const isFinalStepReached = currentStepIndex === STEPS.length - 1 && index === currentStepIndex;
                    const isPulsing = index === currentStepIndex && !isFinalStepReached;
                    return (
                      <div
                        key={step}
                        className={`track-order-step${index <= currentStepIndex ? " done" : ""}${isPulsing ? " current" : ""}`}
                      >
                        <div className="track-order-step-dot">
                          {index < currentStepIndex || isFinalStepReached ? (
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <span />
                          )}
                        </div>
                        {index < STEPS.length - 1 && <div className="track-order-step-line" />}
                        <p className="track-order-step-label">{step}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="track-order-items">
                <p className="track-order-items-title">Items</p>
                {order.items.map((item, index) => (
                  <div className="track-order-item" key={index}>
                    <img src={`${BACKEND_URL}/images/${item.image}`} alt="" />
                    <p>{item.name}</p>
                    <p>x{item.quantity}</p>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackOrder;
