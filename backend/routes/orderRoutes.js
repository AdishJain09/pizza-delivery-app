import express from "express";
import {
  createRazorpayOrder,
  verifyAndPlaceOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import { protectUser, protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/razorpay", protectUser, createRazorpayOrder);
router.post("/verify", protectUser, verifyAndPlaceOrder);
router.get("/mine", protectUser, getMyOrders);
router.get("/", protectAdmin, getAllOrders);
router.patch("/:id/status", protectAdmin, updateOrderStatus);

export default router;
