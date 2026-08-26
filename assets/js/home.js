import { setup_page, geticon } from "./common.js";
import { get_app_main_categories, get_main_cat_icon, display_cat_translated_label } from "./services.js";

function showCategories() {
  const container = document.getElementById("home-categories");
  const categories = get_app_main_categories();

  container.innerHTML = categories.map((category) => `
    <button class="category-tile" type="button" data-category="${encodeURIComponent(category)}">
      ${geticon(get_main_cat_icon(category))}
      <strong>${display_cat_translated_label(category)}</strong>
    </button>
  `).join("");

  container.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = `find.html?category=${encodeURIComponent(button.dataset.category)}`;//destinationForCategory(decodeURIComponent(button.dataset.category));
    });
  });
}

async function start() {
  await setup_page();
  showCategories();

  document.getElementById("find-help-button").addEventListener("click", () => {
    window.location.href = "find.html";
  });

  document.addEventListener("languagechange", showCategories);
}

start();
