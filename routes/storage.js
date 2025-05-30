import express from "express";
import FoodStorage from "../models/foodStorage.js";

const router = express.Router();

// Show form and list of stored items
router.get("/", async (req, res) => {
  try {
    const storage = await FoodStorage.find().sort({ name: 1 });
    res.render("storage", { storage });
  } catch (err) {
    console.error("Error loading food storage:", err.message);
    res.status(500).send("Error loading food storage");
  }
});

// Handle new item submission
router.post("/", async (req, res) => {
  try {
    const { name, quantity, unit, expires, category } = req.body;
    await FoodStorage.create({ name, quantity, unit, expires, category });
    res.redirect("/storage");
  } catch (err) {
    console.error("Error saving storage item:", err.message);
    res.status(500).send("Error saving storage item");
  }
});

export default router;
