import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderList.css";
import api from "../../utils/api";
import { assets } from "../../assets/frontend_assets/assets";
import { getStatusClass } from "../../utils/orderStatus";
import { toast } from "react-toastify";

// Every order a logged-in customer has ever placed — new, old, pending,
// completed, or cancelled. Shared by the My Orders page and the Track
// Order page so a signed-in user never has to hunt for a tracking ID
// just to see their own order history.
const OrderList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/order/userorders", {});
      if (response.data.success) {
        setData(response.data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Cancel this order? If it was already paid, you'll be refunded.")) {
      return;
    }
    setCancellingId(orderId);
    try {
      const response = await api.post("/api/order/cancel", { orderId });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="order-list-status-text">Loading your orders...</p>;

  if (data.length === 0) {
    return (
      <div className="order-list-empty">
        <p className="order-list-empty-title">No orders yet</p>
        <p>Your placed orders — pending, completed, or cancelled — will show up here.</p>
      </div>
    );
  }

  return (
    <div className="order-list">
      {data.map((order) => (
        <div key={order._id} className="order-list-row">
          <img src={assets.parcel_icon} alt="" />
          <div>
            <p>
              {order.items.map((item, index) =>
                index === order.items.length - 1
                  ? `${item.name} X ${item.quantity}`
                  : `${item.name} X ${item.quantity}, `
              )}
            </p>
            <p className="order-list-tracking-id">Tracking ID: {order.trackingId}</p>
          </div>
          <p>${order.amount.toFixed(2)}</p>
          <p>items: {order.items.length}</p>
          <p className={`order-list-status-pill ${getStatusClass(order.status)}`}>
            <span>&#x25cf;</span>
            <b> {order.status}</b>
          </p>
          <button onClick={() => navigate(`/track/${order.trackingId}`)}>Track Order</button>
          {order.status === "Food Processing" && (
            <button
              className="order-list-cancel"
              disabled={cancellingId === order._id}
              onClick={() => cancelOrder(order._id)}
            >
              {cancellingId === order._id ? "Cancelling..." : "Cancel Order"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderList;
