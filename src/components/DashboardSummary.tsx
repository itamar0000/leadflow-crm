// DashboardSummary component
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLeadsStore } from "../store/useLeadsStore";
import {
  isThisWeek,
  isThisMonth,
  parseISO,
} from "date-fns";

export default function DashboardSummary() {
  const { t } = useTranslation();
  const leads = useLeadsStore((s) => s.leads);

  const activeLeads = leads.filter((l) => l.stage !== "done").length;

  const weekAppointments = leads.filter(
    (l) =>
      l.appointmentDate &&
      l.stage === "booked" &&
      isThisWeek(parseISO(l.appointmentDate), { weekStartsOn: 0 })
  ).length;

  const monthRevenue = leads
    .filter((l) => l.stage === "done")
    .flatMap((l) => l.history)
    .filter((h) => isThisMonth(parseISO(h.date)))
    .reduce((sum, h) => sum + h.amount, 0);

  const followUpCount = leads.filter((l) => l.stage === "followup").length;

  const cards = [
    {
      label: t("dashboard.activeLeads"),
      value: activeLeads,
      icon: "📥",
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-rose-50",
    },
    {
      label: t("dashboard.weekAppointments"),
      value: weekAppointments,
      icon: "📅",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
    },
    {
      label: t("dashboard.monthRevenue"),
      value: `₪${monthRevenue.toLocaleString()}`,
      icon: "💰",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
    },
    {
      label: t("dashboard.needsFollowup"),
      value: followUpCount,
      icon: "🔔",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
          className="bg-white rounded-2xl p-4 card-shadow border border-warm-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-9 h-9 ${card.bgColor} rounded-xl flex items-center justify-center`}>
              <span className="text-lg">{card.icon}</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-warm-800 mb-1">
            {card.value}
          </p>
          <p className="text-xs text-warm-500 font-medium">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
