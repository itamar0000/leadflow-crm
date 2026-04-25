import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLeadsStore } from "../store/useLeadsStore";
import { setAppLanguage } from "../i18n";
import toast from "react-hot-toast";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings, exportCSV, clearAll } = useLeadsStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === "he" ? "en" : "he";
    setAppLanguage(newLang as "he" | "en");
    updateSettings({ language: newLang as "he" | "en" });
  };

  const handleExport = () => {
    exportCSV();
    toast.success(t("settings.exportSuccess"));
  };

  const handleClear = () => {
    clearAll();
    setShowClearConfirm(false);
    toast.success(t("settings.clearSuccess"));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 pt-safe min-h-screen"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <h1 className="text-xl font-bold text-warm-800">{t("settings.title")}</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Business info */}
        <div className="bg-white rounded-2xl p-4 card-shadow border border-warm-100 space-y-4">
          <h3 className="font-semibold text-sm text-warm-800">
            {i18n.language === "he" ? "פרטי עסק" : "Business Info"}
          </h3>

          <div>
            <label className="text-xs font-medium text-warm-600 mb-1 block">
              {t("settings.businessName")}
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => updateSettings({ businessName: e.target.value })}
              placeholder={i18n.language === "he" ? "למשל: סטודיו מיכל" : "e.g., Studio Michal"}
              className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-warm-600 mb-1 block">
              {t("settings.ownerName")}
            </label>
            <input
              type="text"
              value={settings.ownerName}
              onChange={(e) => updateSettings({ ownerName: e.target.value })}
              placeholder={i18n.language === "he" ? "השם שלך" : "Your name"}
              className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all"
            />
          </div>
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl p-4 card-shadow border border-warm-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-warm-800">
                {t("settings.language")}
              </h3>
              <p className="text-[11px] text-warm-500 mt-0.5">
                {i18n.language === "he" ? t("settings.hebrew") : t("settings.english")}
              </p>
            </div>
            <button
              onClick={handleLanguageToggle}
              className="relative w-16 h-8 rounded-full bg-warm-200 transition-colors duration-300"
              role="switch"
              aria-checked={i18n.language === "en"}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white card-shadow transition-all duration-300 flex items-center justify-center text-[10px] font-bold ${
                  i18n.language === "en"
                    ? "start-1"
                    : "start-[calc(100%-28px)]"
                }`}
              >
                {i18n.language === "he" ? "עב" : "EN"}
              </div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl overflow-hidden card-shadow border border-warm-100">
          {/* Export CSV */}
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-warm-50 transition-colors active:bg-warm-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <span className="text-sm font-medium text-warm-800">
                {t("settings.exportCSV")}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-300">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <div className="h-px bg-warm-100 mx-4" />

          {/* Clear data */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-between px-4 py-4 hover:bg-red-50 transition-colors active:bg-red-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <span className="text-sm font-medium text-red-500">
                {t("settings.clearData")}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-300">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Clear confirmation */}
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3"
          >
            <p className="text-sm text-red-700 font-medium text-center">
              {t("settings.clearConfirm")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-warm-100 text-warm-600 text-sm font-medium"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium"
              >
                {t("common.confirm")}
              </button>
            </div>
          </motion.div>
        )}

        {/* App info */}
        <div className="text-center py-6">
          <p className="text-warm-400 text-xs">LeadFlow v1.0</p>
          <p className="text-warm-300 text-[10px] mt-1">
            {i18n.language === "he"
              ? "נתונים נשמרים במכשיר בלבד"
              : "Data is stored on this device only"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
