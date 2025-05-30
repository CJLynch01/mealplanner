import fetch from "node-fetch";

/**
 * Fetch nutrition info from OpenFoodFacts using a barcode.
 * @param {string} barcode
 */
export async function fetchNutritionByBarcode(barcode) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.product || !data.product.nutriments) {
      console.warn(`⚠️ No product found for barcode: ${barcode}`);
      return null;
    }

    const p = data.product.nutriments;
    return {
      name: data.product.product_name || barcode,
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

/**
 * Fetch nutrition info from OpenFoodFacts using a name.
 * @param {string} input
 */
export async function fetchNutritionByName(input) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    input
  )}&search_simple=1&action=process&json=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const product = data.products?.[0];

    if (!product || !product.nutriments) {
      console.warn(`⚠️ No product found for name: ${input}`);
      return null;
    }

    const p = product.nutriments;
    return {
      name: product.product_name || input,
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
 * Calculate total values and days of caloric support.
 * @param {object} item
 * @param {number} familySize
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