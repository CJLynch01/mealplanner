import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.USDA_API_KEY;

async function searchUSDA(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.foods?.[0];
}

async function getNutritionFromUSDA(fdcId) {
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  const nutr = (name) =>
    data.foodNutrients.find(n => n.nutrientName.toLowerCase().includes(name.toLowerCase()))?.value || 0;

  return {
    name: data.description,
    caloriesPerServing: nutr("Energy"),
    proteinPerServing: nutr("Protein"),
    fatPerServing: nutr("Total lipid"),
    carbsPerServing: nutr("Carbohydrate"),
    ironPerServing: nutr("Iron"),
    vitaminCPerServing: nutr("Vitamin C"),
    vitaminAPerServing: nutr("Vitamin A")
  };
}

export async function fetchNutritionFromUSDA(name) {
  try {
    const food = await searchUSDA(name);
    if (!food) return null;
    return await getNutritionFromUSDA(food.fdcId);
  } catch (err) {
    console.error("USDA API error:", err.message);
    return null;
  }
}