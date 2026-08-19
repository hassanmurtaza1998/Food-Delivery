import "./Orders.css";
import { useState } from "react";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { assets } from "../../assets/assets";
import api from "../../utils/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const fetchAllOrder = async (page = 1) => {
    const response = await api.get(`/api/order/list?page=${page}&limit=20`);
    if (response.data.success) {
      setOrders(response.data.data);
      setPagination(response.data.pagination);
    }
  };

  const statusHandler = async (event, orderId) => {
    const response = await api.post("/api/order/status", {
      orderId,
      status: event.target.value,
    });
    if (response.data.success) {
      toast.success(response.data.message);
      await fetchAllOrder(pagination.page);
    } else {
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    fetchAllOrder(1);
  }, []);

  return (
    <div className="order">
      <p className="admin-page-title">Orders</p>
      <div className="order-list">
        {orders.length === 0 && <p className="order-empty">No orders yet.</p>}
        {orders.map((order) => (
          <div key={order._id} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-food">
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " x " + item.quantity;
                  } else {
                    return item.name + " x " + item.quantity + ", ";
                  }
                })}
              </p>
              <p className="order-item-name">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street + ","}</p>
                <p>
                  {order.address.city +
                    ", " +
                    order.address.state +
                    ", " +
                    order.address.country +
                    ", " +
                    order.address.zipcode}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items: {order.items.length}</p>
            <p>${order.amount.toFixed(2)}</p>
            <span className={`payment-badge ${order.payment ? "paid" : "unpaid"}`}>
              {order.payment ? "Paid" : "Unpaid"}
            </span>
            <select
              onChange={(event) => statusHandler(event, order._id)}
              value={order.status}
              disabled={order.status === "Cancelled"}
            >
              <option value="Food Processing">Food Processing</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
      {pagination.pages > 1 && (
        <div className="list-pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchAllOrder(pagination.page - 1)}
          >
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchAllOrder(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
