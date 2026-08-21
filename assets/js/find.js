
import { initializePage, t, resultCountText } from "./common.js";
import { loadServices, getMainCategories, getCategoryIcon, getCategoryLabel, filterServices, createServiceCard } from "./services.js";
import { icon } from "./common.js";
import { getBrowserLocation, attachDistances, sortByDistance } from "./location.js";

let allServices = [];
let selectedCategory = new URLSearchParams(window.location.search).get("category") || "all";
let query = "";
let userLocation = null;

function renderFilters() {
  const categories = getMainCategories();
  const container = document.getElementById("find-category-filters");

  container.innerHTML = [
    `<button class="filter-chip ${selectedCategory === "all" ? "active" : ""}" type="button" data-category="all">${t("filter.all")}</button>`,
    ...categories.map((category) => `
      <button class="filter-chip category-filter-${category.toLowerCase()} ${selectedCategory.toLowerCase() === category.toLowerCase() ? "active" : ""}"
              type="button"
              data-category="${encodeURIComponent(category)}">
        ${icon(getCategoryIcon(category))}
        <span>${getCategoryLabel(category)}</span>
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
      renderFilters();
      renderResults();
    });
  });
}

function getVisibleServices() {
  let services = filterServices(allServices, query, selectedCategory);
  if (userLocation) services = sortByDistance(attachDistances(services, userLocation));
  return services;
}

function renderResults() {
  const services = getVisibleServices();
  document.getElementById("find-result-count").textContent = resultCountText(services.length);

  document.getElementById("find-service-list").innerHTML = services.length
    ? services.map((service) => createServiceCard(service, service.distanceKm)).join("")
    : `<div class="empty-state">${t("results.none")}</div>`;
}

async function requestLocation() {
  const status = document.getElementById("find-location-status");
  status.textContent = t("location.requesting");

  try {
    userLocation = await getBrowserLocation();
    status.textContent = t("location.allowed");
  } catch (error) {
    status.textContent =
      error.message === "DENIED" ? t("location.denied") : t("location.unavailable");
  }

  renderResults();
}

async function start() {
  await initializePage();
  allServices = await loadServices();
  renderFilters();
  renderResults();

  document.getElementById("service-search").addEventListener("input", (event) => {
    query = event.target.value;
    renderResults();
  });

  requestLocation();

  document.getElementById("find-service-list").addEventListener("click", (event) => {
    if (event.target.closest("[data-location-request]")) {
      requestLocation();
    }
  });

  document.addEventListener("languagechange", () => {
    renderFilters();
    renderResults();
  });
}

start().catch((error) => {
  console.error(error);
  document.getElementById("find-service-list").innerHTML = `<div class="empty-state">${error.message}</div>`;
});
