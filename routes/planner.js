import express from "express";
import Meal from "../models/meal.js";
import Plan from "../models/plan.js";
import { searchProduct, getLocationId } from "../services/krogerService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const meals = await Meal.find({});
  res.render("index", { meals });
});

router.post("/results", async (req, res) => {
  const { mealId, zip } = req.body;

  const meal = await Meal.findById(mealId);
  if (!meal) {
    return res.status(404).send("Meal not found.");
  }

  const locationId = await getLocationId(zip);

  const nestedProducts = await Promise.all(
    meal.ingredients.map(async (item) => {
      const products = await searchProduct(item, locationId);
      console.log(`Found ${products.length} results for "${item}"`);

      return products.map((product) => {
        const price = product?.items?.[0]?.price?.promo || product?.items?.[0]?.price?.regular || 0;
        const image = product?.images?.[0]?.sizes?.find(s => s.size === "medium")?.url || null;

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
