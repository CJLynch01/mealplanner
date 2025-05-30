import mongoose from "mongoose";

const foodStorageSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  unit: String,
  expires: Date,
  category: String,
});

export default mongoose.model("FoodStorage", foodStorageSchema);
