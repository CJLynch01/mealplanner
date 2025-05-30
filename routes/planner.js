import express from "express";
import dayjs from "dayjs";
import Meal from "../models/meal.js";
import Assignment from "../models/assignment.js";
import ShoppingList from "../models/shoppingList.js";
import { searchProduct, getLocationId } from "../services/krogerService.js";

const router = express.Router();

// Root route: Weekly meal planner view
router.get("/", async (req, res) => {
  const startOfWeek = dayjs().startOf("week");
  const assignments = await Assignment.find({
    date: {
      $gte: startOfWeek.toDate(),
      $lte: startOfWeek.add(6, "day").toDate()
    }
  });

  const week = Array.from({ length: 7 }).map((_, i) => {
    const date = startOfWeek.add(i, "day");
    const assignment = assignments.find(a =>
      dayjs(a.date).isSame(date, "day")
    );
    return {
      date: date.format("YYYY-MM-DD"),
      meal: assignment?.mealName || null
    };
  });

  res.render("index", { week });
});

// Assign form: choose meal, fetch Kroger data
router.get("/assign", async (req, res) => {
  const meals = await Meal.find({});
  let selectedMeal = null;
  let ingredientProducts = [];

  if (req.query.mealId) {
    selectedMeal = await Meal.findById(req.query.mealId);
    const locationId = await getLocationId("84040"); // Replace with dynamic ZIP later

    ingredientProducts = await Promise.all(
      selectedMeal.ingredients.map(async (ingredient) => {
        const products = await searchProduct(ingredient, locationId);
        return {
          ingredient,
          products: products.slice(0, 3).map(product => ({
            id: product.productId,
            description: product.description,
            brand: product.brand,
            image: product?.images?.[0]?.sizes?.find(s => s.size === "medium")?.url || null,
            price: product?.items?.[0]?.price?.promo || product?.items?.[0]?.price?.regular || 0
          }))
        };
      })
    );
  }

  res.render("assign", { meals, selectedMeal, ingredientProducts });
});

// Handle assignment form submit
router.post("/assign", async (req, res) => {
  const { date, mealId, selectedProducts } = req.body;
  const meal = await Meal.findById(mealId);
  if (!meal) return res.status(404).send("Meal not found");

  await Assignment.findOneAndUpdate(
    { date: new Date(date) },
    { mealName: meal.name },
    { upsert: true }
  );

  const productArray = Array.isArray(selectedProducts) ? selectedProducts : [selectedProducts];

  const shoppingItems = productArray.map(item => {
    const [ingredient, description, price] = item.split(":::");
    return {
      date: new Date(date),
      ingredient,
      description,
      price: parseFloat(price)
    };
  });

  await ShoppingList.insertMany(shoppingItems);
  res.redirect("/");
});

// View the full shopping list
router.get("/shopping-list", async (req, res) => {
  const list = await ShoppingList.find({}).sort({ date: 1 });
  res.render("shopping-list", { list });
});

export default router;