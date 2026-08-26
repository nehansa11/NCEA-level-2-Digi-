import { setup_page, getIcon } from "./common.js";
import { getAppMainCategories, getMainCatIcon, displayCatTranslatedLabel } from "./services.js";

function showCategories() {
  const container = document.getElementById("home-categories");
  const categories = getAppMainCategories();

  container.innerHTML = categories.map((category) => `
    <button class="category-tile" type="button" data-category="${encodeURIComponent(category)}">
      ${getIcon(getMainCatIcon(category))}
      <strong>${displayCatTranslatedLabel(category)}</strong>
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
