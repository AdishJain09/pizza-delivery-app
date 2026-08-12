import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const [options, setOptions] = useState(null);

  useEffect(() => {
    userApi.get("/inventory/options").then(({ data }) => setOptions(data));
  }, []);

  return (
    <div className="page">
      <h2>Welcome, {user?.name}</h2>
      <p>Design your own pizza from our fresh ingredients, or check on an order in progress.</p>
      <div className="cta-row">
        <Link to="/build-pizza" className="btn">Build a Pizza</Link>
        <Link to="/orders" className="btn secondary">View My Orders</Link>
      </div>

      {options && (
        <div className="options-grid">
          {Object.entries(options).map(([category, items]) => (
            <div key={category} className="option-card">
              <h3>{category}</h3>
              <ul>
                {items.map((i) => (
                  <li key={i.id} className={i.inStock ? "" : "out-of-stock"}>
                    {i.name} {!i.inStock && "(out of stock)"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
