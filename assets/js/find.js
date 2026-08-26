
import { setup_page, _translate, display_result_count_text } from "./common.js";
import { load_json_services, get_app_main_categories, get_main_cat_icon, display_cat_translated_label, search_filter_services, app_service_card } from "./services.js";
import { geticon } from "./common.js";
import { browser_location, attach_distances, sortByDistance } from "./location.js";

let allServices = [];
let selectedCategory = new URLSearchParams(window.location.search).get("category") || "all";
let query = "";
let userLocation = null;
function display_filters() {
  const categories = get_app_main_categories();
  const container = document.getElementById("find-category-filters");

  container.innerHTML = [
    `<button class="filter-chip ${selectedCategory === "all" ? "active" : ""}" type="button" data-category="all">${_translate("filter.all")}</button>`,
    ...categories.map((category) => `
      <button class="filter-chip category-filter-${category.toLowerCase()} ${selectedCategory.toLowerCase() === category.toLowerCase() ? "active" : ""}"
              type="button"
              data-category="${encodeURIComponent(category)}">
        ${geticon(get_main_cat_icon(category))}
        <span>${display_cat_translated_label(category)}</span>
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
      display_filters();
      renderResults();
    });
  });
}
function getVisibleServices() {
  let services = search_filter_services(allServices, query, selectedCategory);
  if (userLocation) services = sortByDistance(attach_distances(services, userLocation));
  return services;
}
function renderResults() {
  const services = getVisibleServices();
  document.getElementById("find-result-count").textContent = display_result_count_text(services.length);

  document.getElementById("find-service-list").innerHTML = services.length
    ? services.map((service) => app_service_card(service, service.distanceKm)).join("")
    : `<div class="empty-state">${_translate("results.none")}</div>`;
}

async function request_user_location() {
  const status = document.getElementById("find-location-status");
  status.textContent = _translate("location.requesting");

  try {
    userLocation = await browser_location();
    status.textContent = _translate("location.allowed");
  } catch (error) {
    status.textContent =
      error.message === "DENIED" ? _translate("location.denied") : _translate("location.unavailable");
  }

  renderResults();
}

async function start() {
  await setup_page();
  allServices = await load_json_services();
  display_filters();
  renderResults();

  document.getElementById("service-search").addEventListener("input", (event) => {
    query = event.target.value;
    renderResults();
  });

  request_user_location();

  document.getElementById("find-service-list").addEventListener("click", (event) => {
    if (event.target.closest("[data-location-request]")) {
      request_user_location();
    }
  });

  document.addEventListener("languagechange", () => {
    display_filters();
    renderResults();
  });
}

start().catch((error) => {
  console.error(error);
  document.getElementById("find-service-list").innerHTML = `<div class="empty-state">${error.message}</div>`;
});
