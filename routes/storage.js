import express from "express";
import FoodStorage from "../models/foodStorage.js";
import { fetchNutritionByName, calculateTotals } from "../services/nutritionService.js";

const router = express.Router();

// Show form and list of stored items
router.get("/", async (req, res) => {
  try {
    const items = await FoodStorage.find().sort({ name: 1 });

    const storage = items.map((item) => {
      const obj = item.toObject();

      // Only calculate if data is available
      if (
        obj.quantity &&
        obj.servingsPerUnit &&
        obj.caloriesPerServing !== undefined
      ) {
        obj.stats = calculateTotals(obj, 5); // 5 = family size
      } else {
        obj.stats = null; // Avoid crash in EJS
      }

      return obj;
    });

    res.render("storage", { storage });
  } catch (err) {
    console.error("Error loading food storage:", err.message);
    res.status(500).send("Error loading food storage");
  }
});

// Handle new item submission with nutrition fetch
router.post("/", async (req, res) => {
  try {
    const { name, quantity, unit, servingsPerUnit, expires, category } = req.body;

    const nutrition = await fetchNutritionByName(name);

    if (!nutrition) {
      return res.status(400).send("Nutrition info not found. Try a different name.");
    }

    await FoodStorage.create({
      name,
      quantity,
      unit,
      servingsPerUnit,
      expires,
      category,
      ...nutrition
    });

    res.redirect("/storage");
  } catch (err) {
    console.error("Error saving storage item:", err.message);
    res.status(500).send("Error saving storage item");
  }
});

export default router;