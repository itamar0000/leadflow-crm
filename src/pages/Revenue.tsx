import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLeadsStore } from "../store/useLeadsStore";
import { format, parseISO } from "date-fns";
import { he, enUS } from "date-fns/locale";

export default function Revenue() {
  const { t, i18n } = useTranslation();
  const leads = useLeadsStore((s) => s.leads);
  const locale = i18n.language === "he" ? he : enUS;

  // All completed appointments with amounts
  const allAppointments = useMemo(() => {
    return leads
      .flatMap((lead) =>
        lead.history.map((h) => ({
          ...h,
          clientName: lead.name,
        }))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [leads]);

  const totalRevenue = allAppointments.reduce((sum, a) => sum + a.amount, 0);

  // Group by month
  const monthlyData = useMemo(() => {
    const months: Record<string, { total: number; count: number; label: string }> = {};
    allAppointments.forEach((apt) => {
      const monthKey = format(parseISO(apt.date), "yyyy-MM");
      const monthLabel = format(parseISO(apt.date), "MMMM yyyy", { locale });
      if (!months[monthKey]) {
        months[monthKey] = { total: 0, count: 0, label: monthLabel };
      }
      months[monthKey].total += apt.amount;
      months[monthKey].count += 1;
    });
    return Object.entries(months).sort(([a], [b]) => b.localeCompare(a));
  }, [allAppointments, locale]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 pt-safe min-h-screen"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <h1 className="text-xl font-bold text-warm-800">{t("revenue.title")}</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Total revenue card */}
        <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl p-5 text-white">
          <p className="text-white/80 text-xs font-medium">
            {t("revenue.totalRevenue")}
          </p>
          <p className="text-3xl font-bold mt-1">₪{totalRevenue.toLocaleString()}</p>
          <p className="text-white/60 text-xs mt-2">
            {allAppointments.length} {t("revenue.completedAppointments").toLowerCase()}
          </p>
        </div>

        {/* Monthly breakdown */}
        {monthlyData.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-warm-700 mb-3">
              {t("revenue.monthlyBreakdown")}
            </h2>
            <div className="space-y-2">
              {monthlyData.map(([key, data], i) => {
                const maxTotal = Math.max(...monthlyData.map(([, d]) => d.total));
                const barWidth = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl p-3.5 card-shadow border border-warm-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-warm-700 capitalize">
                        {data.label}
                      </span>
                      <span className="font-bold text-sm text-warm-800">
                        ₪{data.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
                      />
                    </div>
                    <p className="text-[10px] text-warm-400 mt-1.5">
                      {data.count} {t("revenue.completedAppointments").toLowerCase()}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* All appointments list */}
        {allAppointments.length > 0 ? (
          <div>
            <h2 className="text-sm font-semibold text-warm-700 mb-3">
              {t("revenue.completedAppointments")}
            </h2>
            <div className="space-y-2">
              {allAppointments.map((apt, i) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between bg-white rounded-xl p-3.5 card-shadow border border-warm-100"
                >
                  <div>
                    <p className="text-sm font-medium text-warm-800">
                      {apt.clientName}
                    </p>
                    <p className="text-[11px] text-warm-500 mt-0.5">
                      {t(`services.${apt.service}`)} •{" "}
                      {format(parseISO(apt.date), "d MMM yyyy", { locale })}
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-600">
                    ₪{apt.amount.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-warm-400">
            <span className="text-4xl mb-3">💰</span>
            <p className="text-sm">{t("revenue.noData")}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
