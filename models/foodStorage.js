import mongoose from "mongoose";

const foodStorageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true }, // Number of units (bags, cans, etc.)
  unit: { type: String, default: "bag" },
  servingsPerUnit: Number, // How many servings in each unit
  caloriesPerServing: Number,
  proteinPerServing: Number,
  fatPerServing: Number,
  carbsPerServing: Number,
  ironPerServing: Number, // mg
  vitaminCPerServing: Number, // mg
  vitaminAPerServing: Number, // IU or mcg
  expires: Date,
  category: String
});

export default mongoose.model("FoodStorage", foodStorageSchema);
