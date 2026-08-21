
import { translations } from "./translations.js";
import { APP_CONFIG } from "./config.js";

const PAGE_CONFIG = {
  home: { icon: "home" },
  map: { icon: "map" },
  learn: { icon: "learn" },
  urgent: { icon: "alert" },
  find: { icon: "search" }
};

const NAV_ITEMS = [
  { key: "home", href: "index.html", icon: "home" },
  { key: "map", href: "map.html", icon: "map" },
  { key: "learn", href: "learn.html", icon: "learn" },
  { key: "urgent", href: "urgent.html", icon: "alert" },
  { key: "find", href: "find.html", icon: "search" }
];

let currentLanguage = localStorage.getItem("appLanguage") || "en";
if (!translations[currentLanguage]) currentLanguage = "en";

export function icon(name, className = "icon") {
  return `<img class="${className}" src="assets/icons/${name}.svg" alt="" aria-hidden="true">`;
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key, replacements = {}) {
  let value = translations[currentLanguage]?.[key] ?? translations.en[key] ?? key;
  for (const [token, replacement] of Object.entries(replacements)) {
    value = value.replace(`{${token}}`, replacement);
  }
  return value;
}

export function setLanguage(language) {
  if (!translations[language]) return;
  currentLanguage = language;
  localStorage.setItem("appLanguage", language);
  document.documentElement.lang = language === "mi" ? "mi" : "en";
  applyTranslations();
  renderSharedLayout();
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
}

function renderHeader() {
  const page = document.body.dataset.page || "home";
  const config = PAGE_CONFIG[page] || PAGE_CONFIG.home;
  const header = document.getElementById("app-header");
  if (!header) return;

  header.innerHTML = `
    <div class="header-inner">
      <div class="page-identity">
        ${icon(config.icon)}
        <span>${t(`page.${page}`)}</span>
      </div>
      <div class="brand">
        <div>${t("app.nameLine1")}</div>
        <div>${t("app.nameLine2")}</div>
      </div>
      <div class="header-actions">
        <a class="urgent-link" href="urgent.html">
          ${icon("alert")}
          <span>${t("header.urgent")}</span>
        </a>
        <button class="language-button" id="language-toggle" type="button" title="Change language">
          ${currentLanguage === "en" ? "MI" : "EN"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("language-toggle")?.addEventListener("click", () => {
    setLanguage(currentLanguage === "en" ? "mi" : "en");
  });
}

function renderPrivacyBanner() {
  const container = document.getElementById("privacy-banner");
  if (!container) return;
  container.innerHTML = `
    <div class="privacy-banner" role="note">
      ${icon("shield")}
      <span>${t("privacy.anonymous")}</span>
      <span>${t("privacy.noLogin")}</span>
      <span>${t("privacy.noTracking")}</span>
    </div>
  `;
}

function renderNavigation() {
  const page = document.body.dataset.page || "home";
  const nav = document.getElementById("bottom-navigation");
  if (!nav) return;

  nav.innerHTML = `
    <div class="bottom-nav-inner">
      ${NAV_ITEMS.map((item) => `
        <a class="nav-item ${page === item.key ? "active" : ""} ${item.key === "urgent" ? "urgent-nav" : ""}"
           href="${item.href}"
           ${page === item.key ? 'aria-current="page"' : ""}>
          ${icon(item.icon)}
          <span>${t(`nav.${item.key}`)}</span>
        </a>
      `).join("")}
    </div>
  `;
}

export function renderSharedLayout() {
  renderHeader();
  renderPrivacyBanner();
  renderNavigation();
  applyTranslations();
}

export async function initializePage() {
  document.documentElement.lang = currentLanguage === "mi" ? "mi" : "en";
  renderSharedLayout();
}

export function createCategorySlug(category) {
  return String(category)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function destinationForCategory(category) {
  const page = APP_CONFIG.categoryDestination === "map" ? "map.html" : "find.html";
  return `${page}?category=${encodeURIComponent(category)}`;
}

export function resultCountText(count) {
  if (count === 0) return t("results.none");
  if (count === 1) return t("results.one");
  return t("results.showing", { count: String(count) });
}
