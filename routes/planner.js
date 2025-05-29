import express from "express";
import Meal from "../models/meal.js";
import Plan from "../models/plan.js";
import { searchProduct, getAccessToken, getLocationId } from "../services/krogerService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const meals = await Meal.find({});
  res.render("index", { meals });
});

router.post("/results", async (req, res) => {
  const zip = req.body.zip;
  const meal = await Meal.findById(req.body.mealId);
  const ingredients = meal.ingredients;

  const locationId = await getLocationId(zip);

  const products = await Promise.all(
    ingredients.map(async (item) => {
      const product = await searchProduct(item, locationId);
      return {
        name: item,
        description: product?.description || "Not found",
        price: product?.items?.[0]?.price?.promo || product?.items?.[0]?.price?.regular || 0,
        image: image
    };
    })
  );

  await Plan.create({ mealName: meal.name, ingredients: products });
  res.render("results", { meal: meal.name, products });
});


export default router;
