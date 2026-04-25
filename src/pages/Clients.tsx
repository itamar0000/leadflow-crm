import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLeadsStore } from "../store/useLeadsStore";

export default function Clients() {
  const { t } = useTranslation();
  const leads = useLeadsStore((s) => s.leads);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.service.includes(q)
    );
  }, [leads, search]);

  // Sort alphabetically
  const sortedLeads = [...filteredLeads].sort((a, b) =>
    a.name.localeCompare(b.name, "he")
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 pt-safe min-h-screen"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-xl font-bold text-warm-800">{t("clients.title")}</h1>
        <p className="text-warm-500 text-xs mt-0.5">
          {leads.length} {t("clients.allClients").toLowerCase()}
        </p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <svg
            className="absolute start-3 top-1/2 -translate-y-1/2 text-warm-400"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("clients.search")}
            className="w-full ps-10 pe-4 py-3 bg-white border border-warm-200 rounded-xl text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Clients list */}
      <div className="px-4 space-y-2">
        {sortedLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-warm-400">
            <span className="text-4xl mb-3">👥</span>
            <p className="text-sm">{t("clients.noClients")}</p>
          </div>
        ) : (
          sortedLeads.map((lead, i) => (
            <motion.button
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => navigate(`/client/${lead.id}`)}
              className="w-full flex items-center gap-3 bg-white rounded-xl p-3.5 card-shadow border border-warm-100 text-start active:scale-[0.99] transition-transform"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-rose-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {lead.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-warm-800 truncate">
                  {lead.name}
                </p>
                <p className="text-[11px] text-warm-500 mt-0.5">
                  {t(`services.${lead.service}`)} • {t(`stages.${lead.stage}`)}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-warm-400" dir="ltr">
                  {lead.phone}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-warm-300">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}
