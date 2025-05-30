import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  date: Date,
  mealName: String,
  type: String
});

export default mongoose.model("Assignment", assignmentSchema);