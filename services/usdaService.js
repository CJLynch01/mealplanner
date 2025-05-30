import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.USDA_API_KEY;

/**
 * Search USDA Foods Database for a matching item
 * @param {string} query - Name of the food item
 */
async function searchUSDA(query) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.foods?.[0]; // Return first match
}

/**
 * Get detailed nutrition information using FDC ID
 * @param {string} fdcId
 */
async function getNutritionFromUSDA(fdcId) {
  try {
    const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    const nutr = (name) =>
      data.foodNutrients.find(n =>
        typeof n.nutrientName === "string" &&
        n.nutrientName.toLowerCase().includes(name.toLowerCase())
      )?.value || 0;

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
  } catch (err) {
    console.error("Error in getNutritionFromUSDA:", err.message);
    return null;
  }
}

/**
 * Fetch and return nutrition info by food name
 * @param {string} name
 */
export async function fetchNutritionFromUSDA(name) {
  try {
    const food = await searchUSDA(name);
    if (!food) {
      console.warn(`⚠️ USDA search returned no match for: ${name}`);
      return null;
    }
    return await getNutritionFromUSDA(food.fdcId);
  } catch (err) {
    console.error("USDA API error:", err.message);
    return null;
  }
}

/**
 * Calculate total nutrient values and caloric coverage
 * @param {object} item - One food storage item
 * @param {number} familySize - Default: 5
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
