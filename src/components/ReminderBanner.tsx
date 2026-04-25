// ReminderBanner component
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLeadsStore } from "../store/useLeadsStore";
import { isToday, parseISO, format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function ReminderBanner() {
  const { t, i18n } = useTranslation();
  const leads = useLeadsStore((s) => s.leads);
  const navigate = useNavigate();
  const locale = i18n.language === "he" ? he : enUS;

  const todayReminders = leads.filter(
    (l) => l.followUpDate && isToday(parseISO(l.followUpDate))
  );

  if (todayReminders.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
        <p className="text-emerald-700 text-sm font-medium text-center">
          {t("dashboard.noReminders")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-warm-700 flex items-center gap-2">
        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
        {t("dashboard.todayReminders")} ({todayReminders.length})
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {todayReminders.map((lead, i) => (
          <motion.button
            key={lead.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/client/${lead.id}`)}
            className="flex-shrink-0 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 min-w-[160px] text-start hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <p className="font-semibold text-warm-800 text-sm truncate">
              {lead.name}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {t(`services.${lead.service}`)}
            </p>
            <p className="text-[10px] text-warm-500 mt-1.5">
              {lead.followUpDate &&
                format(parseISO(lead.followUpDate), "d MMM", { locale })}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
