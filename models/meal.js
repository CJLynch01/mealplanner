import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [String],
});

export default mongoose.model("Meal", mealSchema);