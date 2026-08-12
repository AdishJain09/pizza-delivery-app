import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import Inventory from "../models/Inventory.js";
import Admin from "../models/Admin.js";

const bases = ["Thin Crust", "Thick Crust", "Cheese Burst", "Whole Wheat", "Gluten Free"];
const sauces = ["Tomato Basil", "BBQ", "Pesto", "Alfredo", "Spicy Arrabbiata"];
const cheeses = ["Mozzarella", "Cheddar", "Parmesan", "Vegan Cheese", "Four Cheese Blend"];
const vegetables = ["Onion", "Capsicum", "Mushroom", "Sweet Corn", "Olives", "Jalapeno", "Tomato", "Baby Corn"];

const run = async () => {
  await connectDB();

  await Inventory.deleteMany({});
  const items = [
    ...bases.map((name) => ({ category: "base", name, stock: 50, lowStockThreshold: 20 })),
    ...sauces.map((name) => ({ category: "sauce", name, stock: 50, lowStockThreshold: 20 })),
    ...cheeses.map((name) => ({ category: "cheese", name, stock: 50, lowStockThreshold: 20 })),
    ...vegetables.map((name) => ({ category: "vegetable", name, stock: 50, lowStockThreshold: 20 }))
  ];
  await Inventory.insertMany(items);
  console.log(`Seeded ${items.length} inventory items`);

  const adminEmail = process.env.ADMIN_SEED_EMAIL;
  const existingAdmin = await Admin.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD, 10);
    await Admin.create({ name: "Admin", email: adminEmail, password: hashed });
    console.log(`Seeded admin account: ${adminEmail}`);
  } else {
    console.log("Admin account already exists, skipping");
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
