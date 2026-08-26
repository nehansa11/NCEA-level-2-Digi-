import { getIcon, _translate } from "./common.js";//importing common file

export const APP_MAIN_CATS = ["Food", "Housing", "Budgeting", "Counselling"];

//Get services fron the json
export async function loadJsonServices() {
  const response = await fetch("assets/data/services.json");

  if (!response.ok) {
    throw new Error("Could not load services json file.");
  }

  const services = await response.json();

  return services.map((service, index) => ({
    ...service,
    id: service.id || `service-${index + 1}`,
    Category: APP_MAIN_CATS.includes(service.Category) ? service.Category : "Counselling",
    lat: Number(service.lat),
    lng: Number(service.lng),
    "Last Updated": ""
  }));
}

//Common function used to get the defined main categories
export function getAppMainCategories() {
  return APP_MAIN_CATS;
}

export function getMainCatIcon(category) {
  const icons = {
    Food: "food",
    Housing: "housing",
    Budgeting: "budget",
    Counselling: "counselling"
  };

  return icons[category] || "counselling";
}

export function displayCatTranslatedLabel(category) {
  const keys = {
    Food: "category.food",
    Housing: "category.housing",
    Budgeting: "category.budgeting",
    Counselling: "category.counselling"
  };
  return _translate(keys[category] || "category.counselling");
}

//Used for search filtering services
export function searchFilterServices(services, query, selectedCategory) {
  const search = String(query || "").trim().toLowerCase();

  return services.filter((service) => {
    const categoryMatch =
      !selectedCategory ||
      selectedCategory === "all" ||
      service.Category.toLowerCase() === selectedCategory.toLowerCase();

    if (!categoryMatch) return false;
    if (!search) return true;

    const searchable = [
      service["Organisation Name"],
      service.Category,
      service["Services Offered"],
      service["Area/Suburb"],
      service.Address
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(search);
  });
}

//Common display for distance
function displayDistance(distanceKm) {
  if (Number.isFinite(distanceKm)) {
    if (distanceKm < 1) {
      return `<span class="service-distance">${Math.round(distanceKm * 1000)} m away</span>`;
    }
    return `<span class="service-distance">${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km away</span>`;
  }

  return `<button class="location-distance-link" type="button" data-location-request>${_translate("location.distancePrompt")}</button>`;
}

//Used to display common service card
export function appServiceCard(service, distanceKm) {
  const category = service.Category || "Counselling";
  const phone = service.Phone || "";
  const tel = phone;
  const lastUpdated = "";

  const reportSubject = encodeURIComponent(
    `Outdated service information: ${service["Organisation Name"]}`
  );

  const reportHref =
    `mailto:nehansawijewardana@gmail.com?subject=${reportSubject}`;

  return `
    <article class="service-card" id="card-${service.id}" data-service-id="${service.id}">
      <div class="service-topline">
        <span class="category-badge category-badge-with-icon category-${category.toLowerCase()}">
          ${getIcon(getMainCatIcon(category))}
          ${displayCatTranslatedLabel(category)}
        </span>
        ${displayDistance(distanceKm)}
      </div>

      <h1>${convertToHtml(service["Organisation Name"] || "Service")}</h1>

      <p class="service-meta service-address">
        ${getIcon("pin")}
        ${convertToHtml(service.Address || service["Area/Suburb"] || "")}
      </p>

      ${service.Website ? `
        <a class="service-website" href="${convertToHtml(service.Website)}"
           target="_blank" rel="noopener noreferrer">
          ${getIcon("external")}
          <span>${_translate("service.website")}</span>
        </a>` : ""}

      <div class="service-report-row">
        <a class="report-link compact-report-link" href="${reportHref}">
          ${_translate("service.report")}
        </a>
      </div>

      <p class="service-meta service-description">
        ${convertToHtml(service["Services Offered"] || "No referral needed")}
      </p>

      ${tel ? `
        <div class="service-call-row">
          <a class="call-button compact-call-button" href="tel:${tel}">
            ${getIcon("phone")}
            <span>${convertToHtml(phone)}</span>
          </a>
        </div>` : ""}
    </article>
  `;
}

//Information content generate
export function infoContent(service, distanceKm) {
  const phone = service.Phone || "";
  const tel = phone;
  const distance = Number.isFinite(distanceKm)
    ? (distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`)
    : _translate("location.distancePrompt");

  return `
    <div class="info-window">
      <h1>${convertToHtml(service["Organisation Name"] || "Service")}</h1>
      <p>${convertToHtml(service.Address || "")}</p>
      <p>${convertToHtml(displayCatTranslatedLabel(service.Category))}</p>
      <p><strong>${convertToHtml(distance)}</strong></p>
      ${tel ? `<p><a href="tel:${tel}">${_translate("service.call")} ${convertToHtml(phone)}</a></p>` : ""}
      ${service.Website ? `<p><a href="${convertToHtml(service.Website)}" target="_blank" rel="noopener noreferrer">${_translate("service.website")}</a></p>` : ""}
    </div>
  `;
}

//Convert to html friendly charactors
function convertToHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}