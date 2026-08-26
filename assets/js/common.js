
import { translations } from "./translations.js";//importing translation

//My app pages here 
const mypages = {
  home: { icon: "home" },
  map: { icon: "map" },
  learn: { icon: "learn" },
  urgent: { icon: "alert" },
  find: { icon: "search" }
};

//Bottom navigation/button item list
const navigation_items = [
  { key: "home", href: "index.html", icon: "home" },
  { key: "map", href: "map.html", icon: "map" },
  { key: "learn", href: "learn.html", icon: "learn" },
  { key: "urgent", href: "urgent.html", icon: "alert" },
  { key: "find", href: "find.html", icon: "search" }
];

//Set current language
let current_lang = localStorage.getItem("appLanguage") || "en";
if (!translations[current_lang]) current_lang = "en";//setting default language as en

//general function to used to get the icon by name
export function geticon(name, className = "icon") {
  return `<img class="${className}" src="assets/icons/${name}.svg" alt="${name}">`;
}

//general function to get the language
export function getlanguage() {
  return current_lang;
}

//general function to translate
export function _translate(key, replacements = {}) {
  let value = translations[current_lang]?.[key] ?? translations.en[key] ?? key;
  for (const [token, replacement] of Object.entries(replacements)) {
    value = value.replace(`{${token}}`, replacement);
  }
  return value;
}

//general function to set the selected language from the header
export function set_language(language) {
  if (!translations[language]) return;
  current_lang = language;
  localStorage.setItem("appLanguage", language);
  document.documentElement.lang = language === "mi" ? "mi" : "en";
  apply_translations();
  display_common_sections();
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
}

//using translation in the js apply translation to all document
export function apply_translations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = _translate(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", _translate(element.dataset.i18nPlaceholder));
  });
}

//Display common header
function display_common_header() {
  const page = document.body.dataset.page || "home";
  const config = mypages[page] || mypages.home;
  const header = document.getElementById("app-header");
  if (!header) return;

  header.innerHTML = `
    <div class="header-inner">
      <div class="page-identity">
        ${geticon(config.icon)}
        <span>${_translate(`page.${page}`)}</span>
      </div>
      <div class="brand">
        <div>${_translate("app.nameLine1")}</div>
        <div>${_translate("app.nameLine2")}</div>
      </div>
      <div class="header-actions">
      <div class="top-row">
        <a class="urgent-link" href="urgent.html">
          ${geticon("alert")}
          <span>${_translate("header.urgent")}</span>
        </a>
        <button class="language-button" id="language-toggle" type="button" title="Change language">
          ${current_lang === "en" ? "MI" : "EN"}
        </button>
      </div>

      <span class="language-hint">Switch Language</span>
    </div>
    </div>
  `;

  document.getElementById("language-toggle")?.addEventListener("click", () => {
    set_language(current_lang === "en" ? "mi" : "en");
  });
}

//Display common privacy banner
function display_privacy_banner() {
  const container = document.getElementById("privacy-banner");
  if (!container) return;
  container.innerHTML = `
    <div class="privacy-banner" role="note">
      ${geticon("shield")}
      <span>${_translate("privacy.anonymous")}</span>
      <span>${_translate("privacy.noLogin")}</span>
      <span>${_translate("privacy.noTracking")}</span>
    </div>
  `;
}

//Display common navigation
function display_navigation() {
  const page = document.body.dataset.page || "home";
  const nav = document.getElementById("bottom-navigation");
  if (!nav) return;

  nav.innerHTML = `
    <div class="bottom-nav-inner">
      ${navigation_items.map((item) => `
        <a class="nav-item ${page === item.key ? "active" : ""} ${item.key === "urgent" ? "urgent-nav" : ""}"
           href="${item.href}"
           ${page === item.key ? 'aria-current="page"' : ""}>
          ${geticon(item.icon)}
          <span>${_translate(`nav.${item.key}`)}</span>
        </a>
      `).join("")}
    </div>
  `;
}

//Main function to use for display common areas
export function display_common_sections() {
  display_common_header();
  display_privacy_banner();
  display_navigation();
  apply_translations();
}

//Setup page
export async function setup_page() {
  document.documentElement.lang = current_lang === "mi" ? "mi" : "en";
  display_common_sections();
}

//Display results count text for each language
export function display_result_count_text(count) {
  if (count === 0) return _translate("results.none");
  if (count === 1) return _translate("results.one");
  return _translate("results.showing", { count: String(count) });
}
