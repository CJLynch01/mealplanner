import mongoose from "mongoose";

const shoppingListSchema = new mongoose.Schema({
  date: Date,
  ingredient: String,
  description: String,
  price: Number
});

export default mongoose.model("ShoppingList", shoppingListSchema);

