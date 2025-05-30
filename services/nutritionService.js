import fetch from "node-fetch";

/**
 * Fetch nutrition info for a food item using OpenFoodFacts.
 * @param {string} name - The food name (e.g., "Krusteaz pancake mix")
 **/

export async function fetchNutritionByName(name) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(name)}&search_simple=1&action=process&json=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const product = data.products?.[0]; // take first result
    if (!product) return null;

    return {
      name: product.product_name,
      caloriesPerServing: product.nutriments['energy-kcal_serving'] || 0,
      proteinPerServing: product.nutriments.proteins_serving || 0,
      fatPerServing: product.nutriments.fat_serving || 0,
      carbsPerServing: product.nutriments.carbohydrates_serving || 0,
      ironPerServing: product.nutriments['iron_serving'] || 0,
      vitaminCPerServing: product.nutriments['vitamin-c_serving'] || 0,
      vitaminAperServing: product.nutriments['vitamin-a_serving'] || 0
    };
  } catch (err) {
    console.error("Error fetching nutrition info:", err.message);
    return null;
  }
}
