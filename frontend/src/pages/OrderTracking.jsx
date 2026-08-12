import { useEffect, useState } from "react";
import { userApi } from "../services/api.js";

const stages = ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered"];

const OrderTracking = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await userApi.get("/orders/mine");
    setOrders(data.orders);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <h2>My Orders</h2>
      {orders.length === 0 && <p>You haven't placed any orders yet.</p>}
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <span>{order.base} · {order.cheese}</span>
            <span>₹{order.price}</span>
          </div>
          <p className="muted">
            {order.sauce} sauce, {order.vegetables.join(", ")} · Qty {order.quantity}
          </p>
          <div className="tracker">
            {stages.map((stage, i) => {
              const currentIndex = stages.indexOf(order.status);
              const done = i <= currentIndex;
              return (
                <div key={stage} className={`tracker-step ${done ? "done" : ""}`}>
                  <div className="dot" />
                  <span>{stage}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTracking;
