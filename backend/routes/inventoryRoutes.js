import express from "express";
import {
  getInventory,
  getPublicInventoryOptions,
  updateStock,
  createInventoryItem
} from "../controllers/inventoryController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/options", getPublicInventoryOptions);
router.get("/", protectAdmin, getInventory);
router.post("/", protectAdmin, createInventoryItem);
router.patch("/:id", protectAdmin, updateStock);

export default router;
