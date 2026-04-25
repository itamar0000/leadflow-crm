import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import he from "./he.json";
import en from "./en.json";

const savedLang = localStorage.getItem("leadflow-language") || "he";

i18n.use(initReactI18next).init({
  resources: {
    he: { translation: he },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Update document direction when language changes
export function setAppLanguage(lang: "he" | "en") {
  i18n.changeLanguage(lang);
  localStorage.setItem("leadflow-language", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
}

// Initialize direction on load
document.documentElement.lang = savedLang;
document.documentElement.dir = savedLang === "he" ? "rtl" : "ltr";

export default i18n;
