// LeadCard component
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import { useLeadsStore } from "../store/useLeadsStore";
import { format, parseISO } from "date-fns";
import { he, enUS } from "date-fns/locale";
import type { Lead, LeadStage } from "../types";
import { STAGE_ORDER } from "../types";
import toast from "react-hot-toast";

const stageColors: Record<LeadStage, string> = {
  new: "bg-blue-100 text-blue-700",
  quoted: "bg-purple-100 text-purple-700",
  booked: "bg-emerald-100 text-emerald-700",
  done: "bg-warm-100 text-warm-600",
  followup: "bg-amber-100 text-amber-700",
};

const stageDots: Record<LeadStage, string> = {
  new: "bg-blue-500",
  quoted: "bg-purple-500",
  booked: "bg-emerald-500",
  done: "bg-warm-400",
  followup: "bg-amber-500",
};

interface LeadCardProps {
  lead: Lead;
  isDragOverlay?: boolean;
}

export default function LeadCard({ lead, isDragOverlay = false }: LeadCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const moveStage = useLeadsStore((s) => s.moveStage);
  const locale = i18n.language === "he" ? he : enUS;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const currentIndex = STAGE_ORDER.indexOf(lead.stage);

  const handleMoveForward = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < STAGE_ORDER.length - 1) {
      const nextStage = STAGE_ORDER[currentIndex + 1];
      moveStage(lead.id, nextStage);
      toast.success(t("toast.stageMoved"));
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`tel:${lead.phone}`, "_self");
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = lead.phone.replace(/^0/, "972");
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={isDragOverlay ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-xl p-3.5 card-shadow border border-warm-100 cursor-grab active:cursor-grabbing ${
        isDragging ? "shadow-lg ring-2 ring-rose-300" : ""
      } ${isDragOverlay ? "shadow-xl rotate-2 scale-105" : ""}`}
      {...attributes}
      {...listeners}
    >
      {/* Top row: name + stage indicator */}
      <div
        className="flex items-start justify-between mb-2"
        onClick={() => navigate(`/client/${lead.id}`)}
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-warm-800 text-sm truncate">
            {lead.name}
          </h4>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${stageDots[lead.stage]}`} />
            <span className="text-[11px] text-warm-500">
              {t(`services.${lead.service}`)}
            </span>
          </div>
        </div>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stageColors[lead.stage]}`}
        >
          {t(`stages.${lead.stage}`)}
        </span>
      </div>

      {/* Date */}
      {lead.appointmentDate && (
        <p className="text-[11px] text-warm-500 mb-2.5 flex items-center gap-1">
          <span>📅</span>
          {format(parseISO(lead.appointmentDate), "d MMM yyyy", { locale })}
        </p>
      )}

      {/* Quick actions */}
      <div className="flex items-center gap-1.5 pt-2 border-t border-warm-100">
        {currentIndex < STAGE_ORDER.length - 1 && (
          <button
            onClick={handleMoveForward}
            className="flex-1 flex items-center justify-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg py-1.5 transition-colors active:scale-95"
            title={t("lead.moveStage")}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {t("lead.moveStage")}
          </button>
        )}
        <button
          onClick={handleCall}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors active:scale-95"
          title={t("lead.call")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
        <button
          onClick={handleWhatsApp}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors active:scale-95"
          title={t("lead.whatsapp")}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
