import Inventory from "../models/Inventory.js";

export const getInventory = async (req, res) => {
  const items = await Inventory.find().sort({ category: 1, name: 1 });
  res.json({ items });
};

export const getPublicInventoryOptions = async (req, res) => {
  const items = await Inventory.find();
  const grouped = { base: [], sauce: [], cheese: [], vegetable: [] };
  items.forEach((item) => {
    grouped[item.category].push({ id: item._id, name: item.name, inStock: item.stock > 0 });
  });
  res.json(grouped);
};

export const updateStock = async (req, res) => {
  const { id } = req.params;
  const { stock, lowStockThreshold } = req.body;

  const item = await Inventory.findById(id);
  if (!item) return res.status(404).json({ message: "Inventory item not found" });

  if (stock !== undefined) item.stock = stock;
  if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;
  if (item.stock > item.lowStockThreshold) item.lowStockAlertSent = false;

  await item.save();
  res.json({ message: "Stock updated", item });
};

export const createInventoryItem = async (req, res) => {
  const { category, name, stock, lowStockThreshold } = req.body;
  const item = await Inventory.create({
    category,
    name,
    stock: stock ?? 0,
    lowStockThreshold: lowStockThreshold ?? Number(process.env.LOW_STOCK_THRESHOLD || 20)
  });
  res.status(201).json({ item });
};
