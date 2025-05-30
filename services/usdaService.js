import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.USDA_API_KEY;

/**
 * Search for a food item in the USDA database by name.
 * @param {string} query - Food name
 * @returns {object|null} First matched food item or null
 */
async function searchUSDA(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.foods?.[0] || null;
}

/**
 * Retrieve full nutrient info for a given USDA food item by fdcId.
 * @param {string} fdcId
 * @returns {object} Nutrition info object
 */
async function getNutritionFromUSDA(fdcId) {
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  // More robust nutrient matching using keyword arrays
  const nutr = (keywords) => {
    const match = data.foodNutrients.find(n =>
      typeof n.nutrientName === "string" &&
      keywords.some(k => n.nutrientName.toLowerCase().includes(k.toLowerCase()))
    );
    return match?.value || 0;
  };

  return {
    name: data.description,
    caloriesPerServing: nutr(["Energy", "Calories"]),
    proteinPerServing: nutr(["Protein"]),
    fatPerServing: nutr(["Total lipid", "Fat"]),
    carbsPerServing: nutr(["Carbohydrate"]),
    ironPerServing: nutr(["Iron"]),
    vitaminCPerServing: nutr(["Vitamin C"]),
    vitaminAPerServing: nutr(["Vitamin A"])
  };
}

/**
 * Unified fetch function that searches and retrieves full USDA nutrition data.
 * @param {string} name
 * @returns {object|null} Nutrition info or null if not found
 */
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

/**
 * Calculate totals from item nutrition and servings.
 * @param {object} item
 * @param {number} familySize
 * @returns {object} Totals
 */
export function calculateTotals(item, familySize = 5) {
  const totalServings = item.quantity * item.servingsPerUnit;

  const totalCalories = totalServings * (item.caloriesPerServing || 0);
  const totalProtein = totalServings * (item.proteinPerServing || 0);
  const totalIron = totalServings * (item.ironPerServing || 0);

  return {
    totalCalories,
    totalProtein,
    totalIron,
    daysOfSupport: Math.floor(totalCalories / (familySize * 2000))
  };
}