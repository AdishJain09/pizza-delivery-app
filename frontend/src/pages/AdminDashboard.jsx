import { useEffect, useState } from "react";
import { adminApi } from "../services/api.js";

const AdminDashboard = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    try {
      const { data } = await adminApi.get("/inventory");
      setItems(data.items);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory");
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const updateStock = async (id, newStock) => {
    await adminApi.patch(`/inventory/${id}`, { stock: Number(newStock) });
    fetchInventory();
  };

  const grouped = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="page">
      <h2>Inventory Dashboard</h2>
      {error && <p className="error">{error}</p>}
      {Object.entries(grouped).map(([category, catItems]) => (
        <div key={category} className="inventory-section">
          <h3>{category}</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {catItems.map((item) => (
                <InventoryRow key={item._id} item={item} onUpdate={updateStock} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

const InventoryRow = ({ item, onUpdate }) => {
  const [value, setValue] = useState(item.stock);

  return (
    <tr className={item.stock < item.lowStockThreshold ? "low-stock" : ""}>
      <td>{item.name}</td>
      <td>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="0"
        />
      </td>
      <td>{item.lowStockThreshold}</td>
      <td>
        <button onClick={() => onUpdate(item._id, value)}>Save</button>
      </td>
    </tr>
  );
};

export default AdminDashboard;
