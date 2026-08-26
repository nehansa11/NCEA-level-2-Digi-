import { icon, t } from "./common.js";

export const MAIN_CATEGORIES = ["Food", "Housing", "Budgeting", "Counselling"];

export async function loadServices() {
  const response = await fetch("assets/data/services.json");

  if (!response.ok) {
    throw new Error("Could not load services data file.");
  }

  const services = await response.json();

  return services.map((service, index) => ({
    ...service,
    id: service.id || `service-${index + 1}`,
    Category: MAIN_CATEGORIES.includes(service.Category) ? service.Category : "Counselling",
    lat: Number(service.lat),
    lng: Number(service.lng),
    "Last Updated": ""
  }));
}

export function getMainCategories() {
  return MAIN_CATEGORIES;
}

export function getCategoryIcon(category) {
  const icons = {
    Food: "food",
    Housing: "housing",
    Budgeting: "budget",
    Counselling: "counselling"
  };

  return icons[category] || "counselling";
}

export function getCategoryLabel(category) {
  const keys = {
    Food: "category.food",
    Housing: "category.housing",
    Budgeting: "category.budgeting",
    Counselling: "category.counselling"
  };
  return t(keys[category] || "category.counselling");
}

export function filterServices(services, query, selectedCategory) {
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

function distanceDisplay(distanceKm) {
  if (Number.isFinite(distanceKm)) {
    if (distanceKm < 1) {
      return `<span class="service-distance">${Math.round(distanceKm * 1000)} m away</span>`;
    }
    return `<span class="service-distance">${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km away</span>`;
  }

  return `<button class="location-distance-link" type="button" data-location-request>${t("location.distancePrompt")}</button>`;
}

export function createServiceCard(service, distanceKm) {
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
          ${icon(getCategoryIcon(category))}
          ${getCategoryLabel(category)}
        </span>
        ${distanceDisplay(distanceKm)}
      </div>

      <h1>${escapeHtml(service["Organisation Name"] || "Service")}</h1>

      <p class="service-meta service-address">
        ${icon("pin")}
        ${escapeHtml(service.Address || service["Area/Suburb"] || "")}
      </p>

      ${service.Website ? `
        <a class="service-website" href="${escapeAttribute(service.Website)}"
           target="_blank" rel="noopener noreferrer">
          ${icon("external")}
          <span>${t("service.website")}</span>
        </a>` : ""}

      <div class="service-report-row">
        <a class="report-link compact-report-link" href="${reportHref}">
          ${t("service.report")}
        </a>
      </div>

      <p class="service-meta service-description">
        ${escapeHtml(service["Services Offered"] || "No referral needed")}
      </p>

      ${tel ? `
        <div class="service-call-row">
          <a class="call-button compact-call-button" href="tel:${tel}">
            ${icon("phone")}
            <span>${escapeHtml(phone)}</span>
          </a>
        </div>` : ""}
    </article>
  `;
}

export function createInfoWindowContent(service, distanceKm) {
  const phone = service.Phone || "";
  const tel = phone;
  const distance = Number.isFinite(distanceKm)
    ? (distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`)
    : t("location.distancePrompt");

  return `
    <div class="info-window">
      <h1>${escapeHtml(service["Organisation Name"] || "Service")}</h1>
      <p>${escapeHtml(service.Address || "")}</p>
      <p>${escapeHtml(getCategoryLabel(service.Category))}</p>
      <p><strong>${escapeHtml(distance)}</strong></p>
      ${tel ? `<p><a href="tel:${tel}">${t("service.call")} ${escapeHtml(phone)}</a></p>` : ""}
      ${service.Website ? `<p><a href="${escapeAttribute(service.Website)}" target="_blank" rel="noopener noreferrer">${t("service.website")}</a></p>` : ""}
    </div>
  `;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function escapeAttribute(value) {
  return escapeHtml(value);
}
