import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import Inventory from "../models/Inventory.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const BASE_PRICE = 199;

export const createRazorpayOrder = async (req, res) => {
  const { quantity = 1 } = req.body;
  const amount = BASE_PRICE * quantity * 100;

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`
  });

  res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
};

export const verifyAndPlaceOrder = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    base,
    sauce,
    cheese,
    vegetables,
    quantity
  } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  const items = [
    { category: "base", name: base },
    { category: "sauce", name: sauce },
    { category: "cheese", name: cheese },
    ...vegetables.map((v) => ({ category: "vegetable", name: v }))
  ];

  for (const item of items) {
    const invItem = await Inventory.findOne({ category: item.category, name: item.name });
    if (!invItem || invItem.stock < quantity) {
      return res.status(400).json({ message: `${item.name} is out of stock` });
    }
  }

  for (const item of items) {
    const invItem = await Inventory.findOne({ category: item.category, name: item.name });
    invItem.stock -= quantity;
    await invItem.save();
  }

  const order = await Order.create({
    user: req.user._id,
    base,
    sauce,
    cheese,
    vegetables,
    quantity,
    price: BASE_PRICE * quantity,
    paymentId: razorpay_payment_id,
    paymentStatus: "paid"
  });

  res.status(201).json({ message: "Order placed successfully", order });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.json({ orders });
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ["Order Received", "In Kitchen", "Sent to Delivery", "Delivered"];
  if (!valid.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ message: "Order status updated", order });
};
