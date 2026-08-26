
import { setup_page, _translate, display_result_count_text, geticon } from "./common.js";
import {
  load_json_services,
  get_app_main_categories,
  get_main_cat_icon,
  display_cat_translated_label,
  search_filter_services,
  app_service_card,
  info_content
} from "./services.js";
import { browser_location, attach_distances, sortByDistance } from "./location.js";

let allServices = [];
let selectedCategory = new URLSearchParams(window.location.search).get("category") || "all";
let userLocation = null;
let map = null;
let infoWindow = null;
let markers = [];
let userMarker = null;

function display_google_maps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }

    const callbackName = `initGoogleMaps_${Date.now()}`;
    window[callbackName] = () => {
      delete window[callbackName];
      resolve(window.google.maps);
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAUNz5T2bEf8-99YeQ4iBB7EkKAIMPU9C0&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps could not be loaded."));
    document.head.appendChild(script);
  });
}

function display_filters() {
  const categories = get_app_main_categories();
  const container = document.getElementById("map-category-filters");

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
      display_all();
    });
  });
}

function get_visible_services() {
  let services = search_filter_services(allServices, "", selectedCategory);
  if (userLocation) services = sortByDistance(attach_distances(services, userLocation));
  return services;
}

function display_list(services) {
  document.getElementById("map-result-count").textContent = display_result_count_text(services.length);
  document.getElementById("map-service-list").innerHTML = services.length
    ? services.map((service) => app_service_card(service, service.distanceKm)).join("")
    : `<div class="empty-state">${_translate("results.none")}</div>`;
}

//clear map marks
function clear_markers() {
  markers.forEach((marker) => marker.setMap(null));
  markers = [];
}

function set_map_markers(services) {
  if (!map || !window.google?.maps) return;
  clear_markers();

  const bounds = new google.maps.LatLngBounds();

  services.forEach((service) => {
    if (!Number.isFinite(service.lat) || !Number.isFinite(service.lng)) return;

    const marker = new google.maps.Marker({
      position: { lat: service.lat, lng: service.lng },
      map,
      title: service["Organisation Name"]
    });

    marker.addListener("click", () => {
      infoWindow.setContent(info_content(service, service.distanceKm));
      infoWindow.open({ map, anchor: marker });
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

function display_all() {
  const services = get_visible_services();
  display_list(services);
  set_map_markers(services);
}

//request user to share location
async function request_user_location() {
  const status = document.getElementById("location-status");
  status.textContent = _translate("location.requesting");

  try {
    userLocation = await browser_location();
    status.textContent = _translate("location.allowed");

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
      error.message === "DENIED" ? _translate("location.denied") : _translate("location.unavailable");
  }

  display_all();
}

async function setup_map() {
  const mapElement = document.getElementById("map");
  try {
    await display_google_maps();
    map = new google.maps.Map(mapElement, {
      center: { lat: -41.0, lng: 174.8 },
      zoom: 5,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: false
    });
    infoWindow = new google.maps.InfoWindow();
    display_all();
  } catch (error) {
    mapElement.innerHTML = `<div class="map-placeholder">${error.message}</div>`;
  }
}

async function start() {
  await setup_page();
  allServices = await load_json_services();
  display_filters();
  display_all();
  await setup_map();

  request_user_location();

  document.addEventListener("languagechange", () => {
    display_filters();
    display_all();
  });
}

start().catch((error) => {
  console.error(error);
  document.getElementById("map-service-list").innerHTML = `<div class="empty-state">${error.message}</div>`;
});
