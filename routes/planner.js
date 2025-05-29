import express from "express";
import Meal from "../models/meal.js";
import Plan from "../models/plan.js";
import { searchProduct } from "../services/krogerService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const meals = await Meal.find({});
  res.render("index", { meals });
});

router.post("/results", async (req, res) => {
  const meal = await Meal.findById(req.body.mealId);
  const ingredients = await Promise.all(meal.ingredients.map(async (item) => {
    const result = await searchProduct(item);
    return {
      name: item,
      description: result?.description || "Not found",
      price: result?.items?.[0]?.price?.regular || 0
    };
  }));

  await Plan.create({ mealName: meal.name, ingredients });

  res.render("results", { meal: meal.name, products: ingredients });
});

export default router;
