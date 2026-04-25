import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useLeadsStore } from "../store/useLeadsStore";
import { format, parseISO } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { SERVICE_TYPES, STAGE_ORDER, LEAD_SOURCES } from "../types";
import type { ServiceType, LeadStage, LeadSource } from "../types";
import toast from "react-hot-toast";

export default function ClientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "he" ? he : enUS;

  const lead = useLeadsStore((s) => s.leads.find((l) => l.id === id));
  const updateLead = useLeadsStore((s) => s.updateLead);
  const deleteLead = useLeadsStore((s) => s.deleteLead);
  const addAppointment = useLeadsStore((s) => s.addAppointment);

  const [isEditing, setIsEditing] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit state
  const [editName, setEditName] = useState(lead?.name || "");
  const [editPhone, setEditPhone] = useState(lead?.phone || "");
  const [editService, setEditService] = useState<ServiceType>(lead?.service || "תסרוקת");
  const [editStage, setEditStage] = useState<LeadStage>(lead?.stage || "new");
  const [editSource, setEditSource] = useState<LeadSource>(lead?.source || "whatsapp");
  const [editNotes, setEditNotes] = useState(lead?.notes || "");
  const [editReferredBy, setEditReferredBy] = useState(lead?.referredBy || "");
  const [editAppointmentDate, setEditAppointmentDate] = useState(lead?.appointmentDate || "");
  const [editFollowUpDate, setEditFollowUpDate] = useState(lead?.followUpDate || "");

  // Add service state
  const [newServiceType, setNewServiceType] = useState<ServiceType>("תסרוקת");
  const [newServiceAmount, setNewServiceAmount] = useState("");
  const [newServiceDate, setNewServiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newServiceNotes, setNewServiceNotes] = useState("");

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-warm-500">Lead not found</p>
      </div>
    );
  }

  const totalSpent = lead.history.reduce((sum, h) => sum + h.amount, 0);

  const handleSaveEdit = () => {
    updateLead(lead.id, {
      name: editName,
      phone: editPhone,
      service: editService,
      stage: editStage,
      source: editSource,
      notes: editNotes || undefined,
      referredBy: editReferredBy || undefined,
      appointmentDate: editAppointmentDate || undefined,
      followUpDate: editFollowUpDate || undefined,
    });
    setIsEditing(false);
    toast.success(t("toast.leadUpdated"));
  };

  const handleAddService = () => {
    if (!newServiceAmount) return;
    addAppointment(lead.id, {
      date: newServiceDate,
      service: newServiceType,
      amount: Number(newServiceAmount),
      notes: newServiceNotes || undefined,
    });
    setShowAddService(false);
    setNewServiceAmount("");
    setNewServiceNotes("");
    toast.success(t("toast.appointmentAdded"));
  };

  const handleDelete = () => {
    deleteLead(lead.id);
    toast.success(t("toast.leadDeleted"));
    navigate(-1);
  };

  const handleCall = () => {
    window.open(`tel:${lead.phone}`, "_self");
  };

  const handleWhatsApp = () => {
    const phone = lead.phone.replace(/^0/, "972");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-warm-50 pb-24"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-500 pt-safe">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-white/90 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-white/90 hover:text-white text-sm px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
            >
              {isEditing ? t("common.cancel") : t("lead.edit")}
            </button>
            {isEditing && (
              <button
                onClick={handleSaveEdit}
                className="text-white text-sm px-3 py-1.5 rounded-lg bg-white/25 hover:bg-white/35 font-semibold transition-colors"
              >
                {t("common.save")}
              </button>
            )}
          </div>
        </div>

        {/* Client name & service */}
        <div className="px-5 pb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 text-2xl text-white font-bold">
            {lead.name.charAt(0)}
          </div>
          {isEditing ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-xl font-bold text-white bg-white/15 rounded-lg px-3 py-1 text-center w-full max-w-[250px] mx-auto block"
            />
          ) : (
            <h1 className="text-xl font-bold text-white">{lead.name}</h1>
          )}
          <p className="text-white/80 text-sm mt-1">
            {t(`services.${lead.service}`)} • {t(`stages.${lead.stage}`)}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 px-5 -mt-5 mb-4">
        <button
          onClick={handleCall}
          className="flex-1 bg-white rounded-xl py-3 flex items-center justify-center gap-2 card-shadow-lg text-emerald-600 font-medium text-sm active:scale-[0.98] transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {t("lead.call")}
        </button>
        <button
          onClick={handleWhatsApp}
          className="flex-1 bg-white rounded-xl py-3 flex items-center justify-center gap-2 card-shadow-lg text-green-600 font-medium text-sm active:scale-[0.98] transition-transform"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t("lead.whatsapp")}
        </button>
      </div>

      <div className="px-5 space-y-4">
        {/* Details card */}
        <div className="bg-white rounded-2xl p-4 card-shadow space-y-3">
          <h3 className="font-semibold text-warm-800 text-sm">{t("lead.edit")}</h3>

          {isEditing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-warm-500">{t("lead.phone")}</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-warm-500">{t("lead.service")}</label>
                  <select
                    value={editService}
                    onChange={(e) => setEditService(e.target.value as ServiceType)}
                    className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm"
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>{t(`services.${s}`)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-warm-500">{t("lead.source")}</label>
                  <select
                    value={editSource}
                    onChange={(e) => setEditSource(e.target.value as LeadSource)}
                    className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm"
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>{t(`sources.${s}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-warm-500">{t("lead.moveStage")}</label>
                  <select
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value as LeadStage)}
                    className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm"
                  >
                    {STAGE_ORDER.map((s) => (
                      <option key={s} value={s}>{t(`stages.${s}`)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-warm-500">{t("lead.appointmentDate")}</label>
                  <input
                    type="date"
                    value={editAppointmentDate}
                    onChange={(e) => setEditAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-warm-500">{t("lead.followUpDate")}</label>
                  <input
                    type="date"
                    value={editFollowUpDate}
                    onChange={(e) => setEditFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm"
                    dir="ltr"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-warm-500">{t("lead.referredBy")}</label>
                <input
                  value={editReferredBy}
                  onChange={(e) => setEditReferredBy(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-warm-500">{t("lead.notes")}</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-lg text-sm resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              <InfoRow label={t("lead.phone")} value={lead.phone} dir="ltr" />
              <InfoRow label={t("lead.service")} value={t(`services.${lead.service}`)} />
              <InfoRow label={t("lead.source")} value={t(`sources.${lead.source}`)} />
              {lead.appointmentDate && (
                <InfoRow
                  label={t("lead.appointmentDate")}
                  value={format(parseISO(lead.appointmentDate), "d MMM yyyy", { locale })}
                />
              )}
              {lead.followUpDate && (
                <InfoRow
                  label={t("lead.followUpDate")}
                  value={format(parseISO(lead.followUpDate), "d MMM yyyy", { locale })}
                />
              )}
              {lead.referredBy && (
                <InfoRow label={t("lead.referredBy")} value={lead.referredBy} />
              )}
              {lead.notes && (
                <div className="pt-2 border-t border-warm-100">
                  <p className="text-[11px] text-warm-500 mb-1">{t("lead.notes")}</p>
                  <p className="text-sm text-warm-700">{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total spent */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-4 text-white">
          <p className="text-white/80 text-xs font-medium">{t("lead.totalSpent")}</p>
          <p className="text-2xl font-bold mt-1">₪{totalSpent.toLocaleString()}</p>
        </div>

        {/* Service history */}
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-warm-800 text-sm">
              {t("lead.serviceHistory")}
            </h3>
            <button
              onClick={() => setShowAddService(!showAddService)}
              className="text-rose-500 text-xs font-medium px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              + {t("lead.addAppointment")}
            </button>
          </div>

          {/* Add service form */}
          {showAddService && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-3 bg-warm-50 rounded-xl space-y-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value as ServiceType)}
                  className="px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white"
                >
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>{t(`services.${s}`)}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newServiceAmount}
                  onChange={(e) => setNewServiceAmount(e.target.value)}
                  placeholder={`${t("lead.amount")} (₪)`}
                  className="px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white"
                  dir="ltr"
                />
              </div>
              <input
                type="date"
                value={newServiceDate}
                onChange={(e) => setNewServiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white"
                dir="ltr"
              />
              <input
                value={newServiceNotes}
                onChange={(e) => setNewServiceNotes(e.target.value)}
                placeholder={t("lead.notesPlaceholder")}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm bg-white"
              />
              <button
                onClick={handleAddService}
                disabled={!newServiceAmount}
                className="w-full py-2 bg-rose-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {t("common.save")}
              </button>
            </motion.div>
          )}

          {lead.history.length === 0 ? (
            <p className="text-warm-400 text-sm text-center py-4">
              {t("lead.noHistory")}
            </p>
          ) : (
            <div className="space-y-2">
              {lead.history
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 bg-warm-50 rounded-xl"
                  >
                    <div>
                      <p className="text-sm font-medium text-warm-800">
                        {t(`services.${record.service}`)}
                      </p>
                      <p className="text-[11px] text-warm-500">
                        {format(parseISO(record.date), "d MMM yyyy", { locale })}
                      </p>
                      {record.notes && (
                        <p className="text-[11px] text-warm-400 mt-0.5">{record.notes}</p>
                      )}
                    </div>
                    <span className="font-semibold text-sm text-emerald-600">
                      ₪{record.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Delete button */}
        <div className="pt-4">
          {showDeleteConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm text-red-700 font-medium text-center">
                {t("settings.clearConfirm")}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-warm-100 text-warm-600 text-sm font-medium"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium"
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              {t("lead.delete")}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value, dir }: { label: string; value: string; dir?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-warm-500">{label}</span>
      <span className="text-sm text-warm-700 font-medium" dir={dir}>
        {value}
      </span>
    </div>
  );
}
