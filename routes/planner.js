import express from "express";
import dayjs from "dayjs";
import Meal from "../models/meal.js";
import Plan from "../models/plan.js";
import Assignment from "../models/assignment.js";
import { searchProduct, getLocationId } from "../services/krogerService.js";
import ShoppingList from "../models/shoppingList.js";

const router = express.Router();

// WEEK VIEW: Show meals assigned to each day of the current week
router.get("/assign", async (req, res) => {
  const meals = await Meal.find({});
  let selectedMeal = null;
  let ingredientProducts = [];

  if (req.query.mealId) {
    selectedMeal = await Meal.findById(req.query.mealId);
    const locationId = await getLocationId("84040"); // or dynamic ZIP later

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

// ASSIGN PAGE: Form to assign a meal to a date
router.get("/assign", async (req, res) => {
  const meals = await Meal.find({});
  const selectedMeal = req.query.mealId ? await Meal.findById(req.query.mealId) : null;
  res.render("assign", { meals, selectedMeal });
});

// SAVE ASSIGNMENT

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

// SEARCH PRODUCTS FOR MEAL
router.post("/results", async (req, res) => {
  const { mealId, zip } = req.body;

  const meal = await Meal.findById(mealId);
  if (!meal) return res.status(404).send("Meal not found.");

  const locationId = await getLocationId(zip);

  const nestedProducts = await Promise.all(
    meal.ingredients.map(async (item) => {
      const products = await searchProduct(item, locationId);
      console.log(`Found ${products.length} results for "${item}"`);

      return products.map((product) => {
        const price =
          product?.items?.[0]?.price?.promo ||
          product?.items?.[0]?.price?.regular ||
          0;
        const image =
          product?.images?.[0]?.sizes?.find(s => s.size === "medium")?.url ||
          null;

        return {
          name: item,
          description: product?.description || "Not found",
          brand: product?.brand || "Unknown",
          price,
          image
        };
      });
    })
  );

  const products = nestedProducts.flat();

  await Plan.create({
    mealName: meal.name,
    ingredients: products
  });

  res.render("results", { meal: meal.name, products });
});

export default router;