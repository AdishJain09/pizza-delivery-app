import cron from "node-cron";
import Inventory from "../models/Inventory.js";
import { sendEmail } from "../utils/sendEmail.js";

export const startStockCheckCron = () => {
  cron.schedule("*/30 * * * *", async () => {
    const lowItems = await Inventory.find({
      $expr: { $lt: ["$stock", "$lowStockThreshold"] },
      lowStockAlertSent: false
    });

    if (lowItems.length === 0) return;

    const rows = lowItems
      .map((i) => `<tr><td>${i.category}</td><td>${i.name}</td><td>${i.stock}</td><td>${i.lowStockThreshold}</td></tr>`)
      .join("");

    await sendEmail({
      to: process.env.ADMIN_ALERT_EMAIL,
      subject: "Low Stock Alert - Pizza Delivery",
      html: `<p>The following inventory items are below their configured threshold:</p>
        <table border="1" cellpadding="6" cellspacing="0">
          <tr><th>Category</th><th>Item</th><th>Current Stock</th><th>Threshold</th></tr>
          ${rows}
        </table>`
    });

    for (const item of lowItems) {
      item.lowStockAlertSent = true;
      await item.save();
    }

    console.log(`Low stock alert sent for ${lowItems.length} item(s)`);
  });

  console.log("Stock check cron job scheduled (every 30 minutes)");
};
