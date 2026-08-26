import { geticon, _translate } from "./common.js";//importing common file

export const APP_MAIN_CATS = ["Food", "Housing", "Budgeting", "Counselling"];

//Get services fron the json
export async function load_json_services() {
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
export function get_app_main_categories() {
  return APP_MAIN_CATS;
}

export function get_main_cat_icon(category) {
  const icons = {
    Food: "food",
    Housing: "housing",
    Budgeting: "budget",
    Counselling: "counselling"
  };

  return icons[category] || "counselling";
}

export function display_cat_translated_label(category) {
  const keys = {
    Food: "category.food",
    Housing: "category.housing",
    Budgeting: "category.budgeting",
    Counselling: "category.counselling"
  };
  return _translate(keys[category] || "category.counselling");
}

//Used for search filtering services
export function search_filter_services(services, query, selectedCategory) {
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
function display_distance(distanceKm) {
  if (Number.isFinite(distanceKm)) {
    if (distanceKm < 1) {
      return `<span class="service-distance">${Math.round(distanceKm * 1000)} m away</span>`;
    }
    return `<span class="service-distance">${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km away</span>`;
  }

  return `<button class="location-distance-link" type="button" data-location-request>${_translate("location.distancePrompt")}</button>`;
}

//Used to display common service card
export function app_service_card(service, distanceKm) {
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
          ${geticon(get_main_cat_icon(category))}
          ${display_cat_translated_label(category)}
        </span>
        ${display_distance(distanceKm)}
      </div>

      <h1>${convert_to_html(service["Organisation Name"] || "Service")}</h1>

      <p class="service-meta service-address">
        ${geticon("pin")}
        ${convert_to_html(service.Address || service["Area/Suburb"] || "")}
      </p>

      ${service.Website ? `
        <a class="service-website" href="${convert_to_html(service.Website)}"
           target="_blank" rel="noopener noreferrer">
          ${geticon("external")}
          <span>${_translate("service.website")}</span>
        </a>` : ""}

      <div class="service-report-row">
        <a class="report-link compact-report-link" href="${reportHref}">
          ${_translate("service.report")}
        </a>
      </div>

      <p class="service-meta service-description">
        ${convert_to_html(service["Services Offered"] || "No referral needed")}
      </p>

      ${tel ? `
        <div class="service-call-row">
          <a class="call-button compact-call-button" href="tel:${tel}">
            ${geticon("phone")}
            <span>${convert_to_html(phone)}</span>
          </a>
        </div>` : ""}
    </article>
  `;
}

//Information content generate
export function info_content(service, distanceKm) {
  const phone = service.Phone || "";
  const tel = phone;
  const distance = Number.isFinite(distanceKm)
    ? (distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`)
    : _translate("location.distancePrompt");

  return `
    <div class="info-window">
      <h1>${convert_to_html(service["Organisation Name"] || "Service")}</h1>
      <p>${convert_to_html(service.Address || "")}</p>
      <p>${convert_to_html(display_cat_translated_label(service.Category))}</p>
      <p><strong>${convert_to_html(distance)}</strong></p>
      ${tel ? `<p><a href="tel:${tel}">${_translate("service.call")} ${convert_to_html(phone)}</a></p>` : ""}
      ${service.Website ? `<p><a href="${convert_to_html(service.Website)}" target="_blank" rel="noopener noreferrer">${_translate("service.website")}</a></p>` : ""}
    </div>
  `;
}

//Convert to html friendly charactors
function convert_to_html(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}