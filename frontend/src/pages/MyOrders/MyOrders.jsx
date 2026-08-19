import "./MyOrders.css";
import OrderList from "../../components/OrderList/OrderList";

const MyOrders = () => {
  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <OrderList />
    </div>
  );
};

export default MyOrders;
