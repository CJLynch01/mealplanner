import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import expressLayouts from "express-ejs-layouts";
import plannerRoutes from "./routes/planner.js";
import storageRoutes from "./routes/storage.js";

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("layout", "layout");
app.use(expressLayouts);

app.use("/storage", storageRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/", plannerRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));