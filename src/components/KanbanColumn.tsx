// KanbanColumn component
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";
import type { Lead, LeadStage } from "../types";
import LeadCard from "./LeadCard";

const stageGradients: Record<LeadStage, string> = {
  new: "from-blue-500 to-blue-600",
  quoted: "from-purple-500 to-purple-600",
  booked: "from-emerald-500 to-emerald-600",
  done: "from-warm-400 to-warm-500",
  followup: "from-amber-500 to-amber-600",
};

interface KanbanColumnProps {
  stage: LeadStage;
  leads: Lead[];
}

export default function KanbanColumn({ stage, leads }: KanbanColumnProps) {
  const { t } = useTranslation();

  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      className={`flex-shrink-0 w-[280px] flex flex-col rounded-2xl transition-colors duration-200 ${
        isOver ? "bg-rose-50/80" : "bg-warm-100/60"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full bg-gradient-to-br ${stageGradients[stage]}`}
          />
          <h3 className="font-semibold text-sm text-warm-800">
            {t(`stages.${stage}`)}
          </h3>
        </div>
        <span className="text-xs font-bold text-warm-500 bg-white rounded-full w-6 h-6 flex items-center justify-center card-shadow">
          {leads.length}
        </span>
      </div>

      {/* Cards container */}
      <div
        ref={setNodeRef}
        className="flex-1 p-2 pt-0 space-y-2.5 min-h-[100px] overflow-y-auto"
      >
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-20 text-warm-400 text-xs border-2 border-dashed border-warm-200 rounded-xl">
            {isOver ? "👆 שחרר כאן" : "ריק"}
          </div>
        )}
      </div>
    </div>
  );
}
