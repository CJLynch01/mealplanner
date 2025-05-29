import mongoose from "mongoose";
import dotenv from "dotenv";
import Meal from "../models/meal.js";

dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);

await Meal.deleteMany();

await Meal.insertMany([
  { name: "Spaghetti", ingredients: ["spaghetti noodles", "tomato sauce", "ground beef"] },
  { name: "Tacos", ingredients: ["taco shells", "ground beef", "lettuce", "cheese"] },
  { name: "Chicken Salad", ingredients: ["chicken breast", "lettuce", "ranch dressing"] }
]);

console.log("Meals seeded!");
mongoose.disconnect();
