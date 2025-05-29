import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  mealName: String,
  ingredients: [
    {
      name: String,
      price: Number,
      description: String
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Plan", planSchema);
