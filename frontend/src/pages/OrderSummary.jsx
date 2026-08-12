import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userApi } from "../services/api.js";

const BASE_PRICE = 199;

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const OrderSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selection = location.state;
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (!selection) {
    return (
      <div className="page">
        <p>No pizza selection found.</p>
        <button onClick={() => navigate("/build-pizza")}>Start Building</button>
      </div>
    );
  }

  const total = BASE_PRICE * quantity;

  const payAndOrder = async () => {
    setError("");
    setPlacing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Unable to load Razorpay checkout. Check your connection.");
        setPlacing(false);
        return;
      }

      const { data } = await userApi.post("/orders/razorpay", { quantity });

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Pizza Delivery",
        description: "Custom Pizza Order",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const { data: result } = await userApi.post("/orders/verify", {
              ...response,
              base: selection.base,
              sauce: selection.sauce,
              cheese: selection.cheese,
              vegetables: selection.vegetable,
              quantity
            });
            navigate("/orders", { state: { placed: result.order._id } });
          } catch (err) {
            setError(err.response?.data?.message || "Order confirmation failed");
          } finally {
            setPlacing(false);
          }
        },
        modal: {
          ondismiss: () => setPlacing(false)
        },
        theme: { color: "#d64545" }
      });

      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Could not start payment");
      setPlacing(false);
    }
  };

  return (
    <div className="page">
      <h2>Order Summary</h2>
      <div className="summary-card">
        <p><strong>Base:</strong> {selection.base}</p>
        <p><strong>Sauce:</strong> {selection.sauce}</p>
        <p><strong>Cheese:</strong> {selection.cheese}</p>
        <p><strong>Vegetables:</strong> {selection.vegetable.join(", ")}</p>
        <div className="qty-row">
          <label>Quantity</label>
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity((q) => q + 1)}>+</button>
        </div>
        <p className="total">Total: ₹{total}</p>
      </div>
      {error && <p className="error">{error}</p>}
      <button disabled={placing} onClick={payAndOrder}>
        {placing ? "Processing..." : `Pay ₹${total} & Place Order`}
      </button>
    </div>
  );
};

export default OrderSummary;
