import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useLeadsStore } from "../store/useLeadsStore";
import KanbanColumn from "../components/KanbanColumn";
import LeadCard from "../components/LeadCard";
import { STAGE_ORDER } from "../types";
import type { Lead, LeadStage } from "../types";
import toast from "react-hot-toast";

export default function Pipeline() {
  const { t } = useTranslation();
  const leads = useLeadsStore((s) => s.leads);
  const moveStage = useLeadsStore((s) => s.moveStage);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const lead = leads.find((l) => l.id === event.active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a stage column
    if (STAGE_ORDER.includes(overId as LeadStage)) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && lead.stage !== overId) {
        moveStage(leadId, overId as LeadStage);
        toast.success(t("toast.stageMoved"));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-24 pt-safe min-h-screen"
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-4">
        <h1 className="text-xl font-bold text-warm-800">{t("nav.pipeline")}</h1>
        <p className="text-warm-500 text-xs mt-0.5">
          {leads.length} {t("dashboard.activeLeads").toLowerCase()}
        </p>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
          {STAGE_ORDER.map((stage) => (
            <div key={stage} className="snap-start">
              <KanbanColumn
                stage={stage}
                leads={leads.filter((l) => l.stage === stage)}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeLead && <LeadCard lead={activeLead} isDragOverlay />}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
