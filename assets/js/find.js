
import { setup_page, _translate, displayResultCountText } from "./common.js";
import { loadJsonServices, getAppMainCategories, getMainCatIcon, displayCatTranslatedLabel, searchFilterServices, appServiceCard } from "./services.js";
import { getIcon } from "./common.js";
import { browserLocation, attachDistances, sortByDistance } from "./location.js";

let allServices = [];
let selectedCategory = new URLSearchParams(window.location.search).get("category") || "all";
let query = "";
let userLocation = null;
function displayFilters() {
  const categories = getAppMainCategories();
  const container = document.getElementById("find-category-filters");

  container.innerHTML = [
    `<button class="filter-chip ${selectedCategory === "all" ? "active" : ""}" type="button" data-category="all">${_translate("filter.all")}</button>`,
    ...categories.map((category) => `
      <button class="filter-chip category-filter-${category.toLowerCase()} ${selectedCategory.toLowerCase() === category.toLowerCase() ? "active" : ""}"
              type="button"
              data-category="${encodeURIComponent(category)}">
        ${getIcon(getMainCatIcon(category))}
        <span>${displayCatTranslatedLabel(category)}</span>
      </button>
    `)
  ].join("");

  container.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = decodeURIComponent(button.dataset.category);
      const url = new URL(window.location.href);
      if (selectedCategory === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", selectedCategory);
      history.replaceState({}, "", url);
      displayFilters();
      displayResults();
    });
  });
}
function getVisibleServices() {
  let services = searchFilterServices(allServices, query, selectedCategory);
  if (userLocation) services = sortByDistance(attachDistances(services, userLocation));
  return services;
}
function displayResults() {
  const services = getVisibleServices();
  document.getElementById("find-result-count").textContent = displayResultCountText(services.length);

  document.getElementById("find-service-list").innerHTML = services.length
    ? services.map((service) => appServiceCard(service, service.distanceKm)).join("")
    : `<div class="empty-state">${_translate("results.none")}</div>`;
}

async function requestUserLocation() {
  const status = document.getElementById("find-location-status");
  status.textContent = _translate("location.requesting");

  try {
    userLocation = await browserLocation();
    status.textContent = _translate("location.allowed");
  } catch (error) {
    status.textContent =
      error.message === "DENIED" ? _translate("location.denied") : _translate("location.unavailable");
  }

  displayResults();
}

async function start() {
  await setup_page();
  allServices = await loadJsonServices();
  displayFilters();
  displayResults();

  document.getElementById("service-search").addEventListener("input", (event) => {
    query = event.target.value;
    displayResults();
  });

  requestUserLocation();

  document.getElementById("find-service-list").addEventListener("click", (event) => {
    if (event.target.closest("[data-location-request]")) {
      requestUserLocation();
    }
  });

  document.addEventListener("languagechange", () => {
    displayFilters();
    displayResults();
  });
}

start().catch((error) => {
  console.error(error);
  document.getElementById("find-service-list").innerHTML = `<div class="empty-state">${error.message}</div>`;
});
