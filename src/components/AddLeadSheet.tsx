import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLeadsStore } from "../store/useLeadsStore";
import { SERVICE_TYPES, LEAD_SOURCES } from "../types";
import type { ServiceType, LeadSource } from "../types";
import toast from "react-hot-toast";

interface AddLeadSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddLeadSheet({ isOpen, onClose }: AddLeadSheetProps) {
  const { t } = useTranslation();
  const addLead = useLeadsStore((s) => s.addLead);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<ServiceType>("תסרוקת");
  const [source, setSource] = useState<LeadSource>("whatsapp");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setPhone("");
    setService("תסרוקת");
    setSource("whatsapp");
    setAppointmentDate("");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addLead({
      name: name.trim(),
      phone: phone.trim(),
      service,
      stage: "new",
      source,
      appointmentDate: appointmentDate || undefined,
      notes: notes.trim() || undefined,
    });

    toast.success(t("toast.leadAdded"));
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] overlay"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-warm-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-bold text-warm-800">
                {t("lead.addLead")}
              </h2>
              <button
                onClick={onClose}
                className="text-warm-400 hover:text-warm-600 p-1"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-warm-600 mb-1 block">
                  {t("lead.clientName")} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("lead.namePlaceholder")}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                  required
                  autoFocus
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-warm-600 mb-1 block">
                  {t("lead.phone")} *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("lead.phonePlaceholder")}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all"
                  dir="ltr"
                  required
                />
              </div>

              {/* Service + Source row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-warm-600 mb-1 block">
                    {t("lead.service")}
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value as ServiceType)}
                    className="w-full px-3 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {t(`services.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-warm-600 mb-1 block">
                    {t("lead.source")}
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as LeadSource)}
                    className="w-full px-3 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none"
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {t(`sources.${s}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Appointment date */}
              <div>
                <label className="text-xs font-medium text-warm-600 mb-1 block">
                  {t("lead.appointmentDate")}
                </label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all"
                  dir="ltr"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-warm-600 mb-1 block">
                  {t("lead.notes")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("lead.notesPlaceholder")}
                  rows={2}
                  className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-base shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-transform disabled:opacity-50"
                disabled={!name.trim() || !phone.trim()}
              >
                {t("lead.save")}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
