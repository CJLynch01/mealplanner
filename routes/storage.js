import express from "express";
import FoodStorage from "../models/foodStorage.js";
import { fetchNutritionByBarcode, fetchNutritionByName, calculateTotals } from "../services/nutritionService.js";

const router = express.Router();

// GET: List all items grouped by category
router.get("/", async (req, res) => {
  try {
    const items = await FoodStorage.find().sort({ name: 1 });

    // Group items by category and calculate totals
    const grouped = {};
    items.forEach((item) => {
      const obj = item.toObject();

      obj.stats =
        obj.quantity && obj.servingsPerUnit && obj.caloriesPerServing !== undefined
          ? calculateTotals(obj, 5) // 5 = family size
          : null;

      if (!grouped[obj.category]) grouped[obj.category] = [];
      grouped[obj.category].push(obj);
    });

    res.render("storage", { grouped });
  } catch (err) {
    console.error("Error loading food storage:", err.message);
    res.status(500).send("Error loading food storage");
  }
});

// POST: Add new item with nutrition info
router.post("/", async (req, res) => {
  try {
    const { name, quantity, unit, servingsPerUnit, expires, category } = req.body;

    // First try barcode (if user enters a number), then fallback to name
    const nutrition = /^\d{8,}$/.test(name.trim())
      ? await fetchNutritionByBarcode(name.trim())
      : await fetchNutritionByName(name.trim());

    if (!nutrition) {
      return res.status(400).send("Nutrition info not found. Try a different name or barcode.");
    }

    await FoodStorage.create({
      name: nutrition.name, // Use resolved name if available
      quantity,
      unit,
      servingsPerUnit,
      expires,
      category,
      ...nutrition, // caloriesPerServing, proteinPerServing, etc.
    });

    res.redirect("/storage");
  } catch (err) {
    console.error("Error saving storage item:", err.message);
    res.status(500).send("Error saving storage item");
  }
});

// GET: Edit form
router.get("/edit/:id", async (req, res) => {
  try {
    const item = await FoodStorage.findById(req.params.id);
    if (!item) return res.status(404).send("Item not found");
    res.render("edit-storage", { item });
  } catch (err) {
    console.error("Error loading item for edit:", err.message);
    res.status(500).send("Error loading item");
  }
});

// POST: Save edited item
router.post("/edit/:id", async (req, res) => {
  try {
    const { name, quantity, unit, servingsPerUnit, expires, category } = req.body;

    await FoodStorage.findByIdAndUpdate(req.params.id, {
      name,
      quantity,
      unit,
      servingsPerUnit,
      expires,
      category
    });

    res.redirect("/storage");
  } catch (err) {
    console.error("Error updating item:", err.message);
    res.status(500).send("Error updating item");
  }
});

// POST: Delete item
router.post("/delete/:id", async (req, res) => {
  try {
    await FoodStorage.findByIdAndDelete(req.params.id);
    res.redirect("/storage");
  } catch (err) {
    console.error("Error deleting item:", err.message);
    res.status(500).send("Error deleting item");
  }
});

export default router;