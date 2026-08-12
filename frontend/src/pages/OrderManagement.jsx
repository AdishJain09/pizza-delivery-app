import { useEffect, useState } from "react";
import { adminApi } from "../services/api.js";

const stages = ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered"];

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const { data } = await adminApi.get("/orders");
    setOrders(data.orders);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const changeStatus = async (id, status) => {
    await adminApi.patch(`/orders/${id}/status`, { status });
    fetchOrders();
  };

  return (
    <div className="page">
      <h2>Order Management</h2>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Pizza</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.user?.name}<br /><span className="muted">{order.user?.email}</span></td>
              <td>{order.base}, {order.sauce}, {order.cheese}, {order.vegetables.join(", ")}</td>
              <td>{order.quantity}</td>
              <td>₹{order.price}</td>
              <td>
                <select value={order.status} onChange={(e) => changeStatus(order._id, e.target.value)}>
                  {stages.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderManagement;
