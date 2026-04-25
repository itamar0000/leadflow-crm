import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLeadsStore } from "../store/useLeadsStore";
import { useAuth } from "../lib/auth";
import { SERVICE_TYPES, LEAD_SOURCES } from "../types";
import type { ServiceType, LeadSource } from "../types";
import { parseWhatsAppChat, type ParsedLead } from "../lib/whatsappParser";
import toast from "react-hot-toast";

interface AddLeadSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type ConfidenceLevel = "high" | "medium" | "low";

export default function AddLeadSheet({ isOpen, onClose }: AddLeadSheetProps) {
  const { t } = useTranslation();
  const addLead = useLeadsStore((s) => s.addLead);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState<ServiceType>("תסרוקת");
  const [source, setSource] = useState<LeadSource>("whatsapp");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [notes, setNotes] = useState("");

  // WhatsApp parser state
  const [showParser, setShowParser] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [fieldConfidence, setFieldConfidence] = useState<
    Record<string, ConfidenceLevel>
  >({});

  const resetForm = () => {
    setName("");
    setPhone("");
    setService("תסרוקת");
    setSource("whatsapp");
    setAppointmentDate("");
    setNotes("");
    setFieldConfidence({});
    setPasteText("");
    setShowParser(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !user) return;

    addLead(
      {
        name: name.trim(),
        phone: phone.trim(),
        service,
        stage: "new",
        source,
        appointmentDate: appointmentDate || undefined,
        notes: notes.trim() || undefined,
      },
      user.id
    );

    toast.success(t("toast.leadAdded"));
    resetForm();
    onClose();
  };

  const handleParse = () => {
    if (!pasteText.trim()) return;

    const parsed: ParsedLead = parseWhatsAppChat(pasteText);
    const newConfidence: Record<string, ConfidenceLevel> = {};

    if (parsed.name) {
      setName(parsed.name.value);
      newConfidence.name = parsed.name.confidence;
    }
    if (parsed.phone) {
      setPhone(parsed.phone.value);
      newConfidence.phone = parsed.phone.confidence;
    }
    if (parsed.eventDate) {
      setAppointmentDate(parsed.eventDate.value);
      newConfidence.appointmentDate = parsed.eventDate.confidence;
    }
    if (parsed.service) {
      setService(parsed.service.value);
      newConfidence.service = parsed.service.confidence;
    }
    if (parsed.notes) {
      setNotes(parsed.notes);
    }

    // Source is always WhatsApp when pasting from WhatsApp
    setSource("whatsapp");

    setFieldConfidence(newConfidence);
    setShowParser(false);
    toast.success("הנתונים חולצו בהצלחה ✓");
  };

  const confidenceBorder = (field: string) => {
    const level = fieldConfidence[field];
    if (!level) return "";
    if (level === "low") return "ring-2 ring-amber-400 border-amber-400";
    if (level === "medium") return "ring-2 ring-amber-300 border-amber-300";
    return "";
  };

  const confidenceIcon = (field: string) => {
    const level = fieldConfidence[field];
    if (level === "low" || level === "medium") {
      return (
        <span className="absolute end-3 top-1/2 -translate-y-1/2 text-amber-500 text-sm" title="ייתכן שדרוש תיקון">
          ⚠️
        </span>
      );
    }
    return null;
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* WhatsApp Parser button */}
            <div className="px-5 mb-3">
              <button
                type="button"
                onClick={() => setShowParser(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-green-300 bg-green-50 text-green-700 font-medium text-sm hover:bg-green-100 transition-colors active:scale-[0.99]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                📋 הדביקי מוואטסאפ
              </button>
            </div>

            {/* WhatsApp Parser Modal */}
            <AnimatePresence>
              {showParser && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[80] flex items-end justify-center"
                >
                  <div
                    className="absolute inset-0 overlay"
                    onClick={() => setShowParser(false)}
                  />
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    className="relative bg-white rounded-t-3xl w-full max-h-[80vh] p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-warm-800">
                        📋 הדביקי שיחה מוואטסאפ
                      </h3>
                      <button
                        onClick={() => setShowParser(false)}
                        className="text-warm-400 hover:text-warm-600 p-1"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-xs text-warm-500">
                      העתיקי את השיחה מוואטסאפ והדביקי כאן. ננסה לחלץ את הפרטים
                      אוטומטית.
                    </p>

                    <textarea
                      value={pasteText}
                      onChange={(e) => setPasteText(e.target.value)}
                      placeholder="הדביקי כאן את השיחה..."
                      rows={8}
                      className="w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all resize-none text-sm"
                      autoFocus
                    />

                    <button
                      onClick={handleParse}
                      disabled={!pasteText.trim()}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-base shadow-lg shadow-green-500/20 active:scale-[0.98] transition-transform disabled:opacity-50"
                    >
                      🔍 נתחי את השיחה
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-5 pb-8 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-warm-600 mb-1 block">
                  {t("lead.clientName")} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("lead.namePlaceholder")}
                    className={`w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all ${confidenceBorder("name")}`}
                    required
                  />
                  {confidenceIcon("name")}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-medium text-warm-600 mb-1 block">
                  {t("lead.phone")} *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("lead.phonePlaceholder")}
                    className={`w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition-all ${confidenceBorder("phone")}`}
                    dir="ltr"
                    required
                  />
                  {confidenceIcon("phone")}
                </div>
              </div>

              {/* Service + Source row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-warm-600 mb-1 block">
                    {t("lead.service")}
                  </label>
                  <select
                    value={service}
                    onChange={(e) =>
                      setService(e.target.value as ServiceType)
                    }
                    className={`w-full px-3 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 focus:outline-none focus:ring-2 focus:ring-rose-300 appearance-none ${confidenceBorder("service")}`}
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
                    onChange={(e) =>
                      setSource(e.target.value as LeadSource)
                    }
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
                <div className="relative">
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className={`w-full px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl text-warm-800 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all ${confidenceBorder("appointmentDate")}`}
                    dir="ltr"
                  />
                  {confidenceIcon("appointmentDate")}
                </div>
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
