import mongoose from "mongoose";

const shoppingListSchema = new mongoose.Schema({
  date: Date,
  ingredient: String
});

export default mongoose.model("ShoppingList", shoppingListSchema);
