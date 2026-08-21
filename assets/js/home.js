import { initializePage, destinationForCategory, icon } from "./common.js";
import { getMainCategories, getCategoryIcon, getCategoryLabel } from "./services.js";
import { APP_CONFIG } from "./config.js";


function showCategories() {
  const container = document.getElementById("home-categories");
  const categories = getMainCategories();

  container.innerHTML = categories.map((category) => `
    <button class="category-tile" type="button" data-category="${encodeURIComponent(category)}">
      ${icon(getCategoryIcon(category))}
      <strong>${getCategoryLabel(category)}</strong>
    </button>
  `).join("");

  container.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      window.location.href = destinationForCategory(decodeURIComponent(button.dataset.category));
    });
  });
}

async function start() {
  await initializePage();
  showCategories();

  document.getElementById("find-help-button").addEventListener("click", () => {
    window.location.href = APP_CONFIG.categoryDestination === "map" ? "map.html" : "find.html";
  });

  document.addEventListener("languagechange", showCategories);
}

start();
