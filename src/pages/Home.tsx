import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import DashboardSummary from "../components/DashboardSummary";
import ReminderBanner from "../components/ReminderBanner";
import { useLeadsStore } from "../store/useLeadsStore";
import { useNavigate } from "react-router-dom";
import { STAGE_ORDER } from "../types";

export default function Home() {
  const { t, i18n } = useTranslation();
  const leads = useLeadsStore((s) => s.leads);
  const settings = useLeadsStore((s) => s.settings);
  const navigate = useNavigate();

  // Get latest leads for quick preview
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 pt-safe"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-5">
        <p className="text-warm-500 text-sm">
          {t("dashboard.welcome")}{settings.ownerName ? `, ${settings.ownerName}` : ""} 👋
        </p>
        <h1 className="text-2xl font-bold text-warm-800 mt-0.5">
          {t("app.name")}
        </h1>
      </div>

      <div className="px-4 space-y-5">
        {/* Summary cards */}
        <DashboardSummary />

        {/* Reminders */}
        <ReminderBanner />

        {/* Quick pipeline preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-warm-700">
              {t("nav.pipeline")}
            </h2>
            <button
              onClick={() => navigate("/pipeline")}
              className="text-rose-500 text-xs font-medium"
            >
              {i18n.language === "en" ? "View All →" : "← הצג הכל"}
            </button>
          </div>

          {/* Stage pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {STAGE_ORDER.map((stage) => {
              const count = leads.filter((l) => l.stage === stage).length;
              return (
                <button
                  key={stage}
                  onClick={() => navigate("/pipeline")}
                  className="flex-shrink-0 bg-white rounded-xl px-4 py-3 card-shadow border border-warm-100 min-w-[120px] active:scale-[0.98] transition-transform"
                >
                  <p className="text-lg font-bold text-warm-800">{count}</p>
                  <p className="text-[11px] text-warm-500 mt-0.5">
                    {t(`stages.${stage}`)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        {recentLeads.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-warm-700 mb-3">
              {i18n.language === "he" ? "פעילות אחרונה" : "Recent Activity"}
            </h2>
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => navigate(`/client/${lead.id}`)}
                  className="w-full flex items-center gap-3 bg-white rounded-xl p-3 card-shadow border border-warm-100 text-start active:scale-[0.99] transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-warm-800 truncate">
                      {lead.name}
                    </p>
                    <p className="text-[11px] text-warm-500">
                      {t(`services.${lead.service}`)} • {t(`stages.${lead.stage}`)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
