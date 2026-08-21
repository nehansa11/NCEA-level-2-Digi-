
import { initializePage, t, resultCountText, icon } from "./common.js";
import { APP_CONFIG } from "./config.js";
import {
  loadServices,
  getMainCategories,
  getCategoryIcon,
  getCategoryLabel,
  filterServices,
  createServiceCard,
  createInfoWindowContent
} from "./services.js";
import { getBrowserLocation, attachDistances, sortByDistance } from "./location.js";

let allServices = [];
let selectedCategory = new URLSearchParams(window.location.search).get("category") || "all";
let userLocation = null;
let map = null;
let infoWindow = null;
let markers = [];
let userMarker = null;

function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    if (!APP_CONFIG.googleMapsApiKey || APP_CONFIG.googleMapsApiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      reject(new Error("Add a restricted Google Maps browser key in assets/js/config.js."));
      return;
    }

    const callbackName = `initGoogleMaps_${Date.now()}`;
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(APP_CONFIG.googleMapsApiKey)}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps could not be loaded."));
    document.head.appendChild(script);
  });
}

function renderFilters() {
  const categories = getMainCategories();
  const container = document.getElementById("map-category-filters");

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
      renderAll();
    });
  });
}

function visibleServices() {
  let services = filterServices(allServices, "", selectedCategory);
  if (userLocation) services = sortByDistance(attachDistances(services, userLocation));
  return services;
}

function renderList(services) {
  document.getElementById("map-result-count").textContent = resultCountText(services.length);
  document.getElementById("map-service-list").innerHTML = services.length
    ? services.map((service) => createServiceCard(service, service.distanceKm)).join("")
    : `<div class="empty-state">${t("results.none")}</div>`;
}

function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

function renderMarkers(services) {
  if (!map || !window.google?.maps) return;
  clearMarkers();

  const bounds = new google.maps.LatLngBounds();

  services.forEach((service) => {
    if (!Number.isFinite(service.lat) || !Number.isFinite(service.lng)) return;

    const marker = new google.maps.Marker({
      position: { lat: service.lat, lng: service.lng },
      map,
      title: service["Organisation Name"]
    });

    marker.addListener("click", () => {
      infoWindow.setContent(createInfoWindowContent(service, service.distanceKm));
      infoWindow.open({ map, anchor: marker });

      document.querySelectorAll(".service-card").forEach((card) => card.classList.remove("highlighted"));
      const card = document.getElementById(`card-${service.id}`);
      card?.classList.add("highlighted");
      card?.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    markers.push(marker);
    bounds.extend(marker.getPosition());
  });

  if (userLocation) bounds.extend(userLocation);

  if (!bounds.isEmpty()) {
    map.fitBounds(bounds, 48);
    google.maps.event.addListenerOnce(map, "idle", () => {
      if (map.getZoom() > 13) map.setZoom(13);
    });
  }
}

function renderAll() {
  const services = visibleServices();
  renderList(services);
  renderMarkers(services);
}

async function requestLocation() {
  const status = document.getElementById("location-status");
  status.textContent = t("location.requesting");

  try {
    userLocation = await getBrowserLocation();
    status.textContent = t("location.allowed");

    if (map && window.google?.maps) {
      userMarker?.setMap(null);
      userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        title: "Your location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2a7d84",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3
        }
      });
    }
  } catch (error) {
    status.textContent =
      error.message === "DENIED" ? t("location.denied") : t("location.unavailable");
  }

  renderAll();
}

async function initialiseMap() {
  const mapElement = document.getElementById("map");
  try {
    await loadGoogleMaps();
    map = new google.maps.Map(mapElement, {
      center: APP_CONFIG.defaultMapCenter,
      zoom: APP_CONFIG.defaultMapZoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false
    });
    infoWindow = new google.maps.InfoWindow();
    renderAll();
  } catch (error) {
    mapElement.innerHTML = `<div class="map-placeholder">${error.message}</div>`;
  }
}

async function start() {
  await initializePage();
  allServices = await loadServices();
  renderFilters();
  renderAll();
  await initialiseMap();

  requestLocation();

  document.getElementById("map-service-list").addEventListener("click", (event) => {
    if (event.target.closest("[data-location-request]")) {
      requestLocation();
    }
  });

  document.getElementById("scroll-to-list").addEventListener("click", () => {
    document.getElementById("map-results-section").scrollIntoView({ behavior: "smooth" });
  });


  document.addEventListener("languagechange", () => {
    renderFilters();
    renderAll();
  });
}

start().catch((error) => {
  console.error(error);
  document.getElementById("map-service-list").innerHTML = `<div class="empty-state">${error.message}</div>`;
});
