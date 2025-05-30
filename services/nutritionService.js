import fetch from "node-fetch";

/**
 * Fetch nutrition info for a food item using OpenFoodFacts.
 * @param {string} name - The food name (e.g., "Krusteaz pancake mix")
 */
export async function fetchNutritionByBarcode(upc) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${upc}.json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.product || !data.product.nutriments) return null;

    const p = data.product.nutriments;
    return {
      name: data.product.product_name || upc,
      caloriesPerServing: p["energy-kcal_serving"] || 0,
      proteinPerServing: p["proteins_serving"] || 0,
      fatPerServing: p["fat_serving"] || 0,
      carbsPerServing: p["carbohydrates_serving"] || 0,
      ironPerServing: p["iron_serving"] || 0,
      vitaminCPerServing: p["vitamin-c_serving"] || 0,
      vitaminAPerServing: p["vitamin-a_serving"] || 0
    };
  } catch (err) {
    console.error("❌ Error fetching by barcode:", err.message);
    return null;
  }
}

export async function fetchNutritionByName(name) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&search_simple=1&action=process&json=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const product = data.products?.[0];
    if (!product || !product.nutriments) return null;

    const p = product.nutriments;
    return {
      name: product.product_name || name,
      caloriesPerServing: p["energy-kcal_serving"] || 0,
      proteinPerServing: p["proteins_serving"] || 0,
      fatPerServing: p["fat_serving"] || 0,
      carbsPerServing: p["carbohydrates_serving"] || 0,
      ironPerServing: p["iron_serving"] || 0,
      vitaminCPerServing: p["vitamin-c_serving"] || 0,
      vitaminAPerServing: p["vitamin-a_serving"] || 0
    };
  } catch (err) {
    console.error("❌ Error fetching by name:", err.message);
    return null;
  }
}

/**
 * Calculate total nutritional values and days of caloric support.
 * @param {object} item - A food item with quantity and per-serving nutrient data
 * @param {number} familySize - Number of people the storage supports (default: 5)
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
