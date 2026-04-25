import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Lead, LeadStage, AppointmentRecord, Settings } from "../types";
import { createSeedData } from "./seedData";

interface LeadsState {
  leads: Lead[];
  settings: Settings;
  isSeeded: boolean;
  hasOnboarded: boolean;

  // Lead actions
  addLead: (lead: Omit<Lead, "id" | "createdAt" | "updatedAt" | "history">) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveStage: (id: string, stage: LeadStage) => void;

  // Appointment actions
  addAppointment: (leadId: string, record: Omit<AppointmentRecord, "id">) => void;

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void;

  // Data actions
  seedData: () => void;
  clearAll: () => void;
  setOnboarded: () => void;
  exportCSV: () => void;
}

export const useLeadsStore = create<LeadsState>()(
  persist(
    (set, get) => ({
      leads: [],
      settings: {
        businessName: "",
        ownerName: "",
        language: "he",
      },
      isSeeded: false,
      hasOnboarded: false,

      addLead: (leadData) => {
        const now = new Date().toISOString();
        const newLead: Lead = {
          ...leadData,
          id: uuidv4(),
          history: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ leads: [...state.leads, newLead] }));
      },

      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
              : lead
          ),
        }));
      },

      deleteLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
        }));
      },

      moveStage: (id, stage) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id
              ? { ...lead, stage, updatedAt: new Date().toISOString() }
              : lead
          ),
        }));
      },

      addAppointment: (leadId, record) => {
        const appointment: AppointmentRecord = {
          ...record,
          id: uuidv4(),
        };
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === leadId
              ? {
                  ...lead,
                  history: [...lead.history, appointment],
                  updatedAt: new Date().toISOString(),
                }
              : lead
          ),
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      seedData: () => {
        const { isSeeded } = get();
        if (!isSeeded) {
          set({ leads: createSeedData(), isSeeded: true });
        }
      },

      clearAll: () => {
        set({ leads: [], isSeeded: false, hasOnboarded: false });
      },

      setOnboarded: () => {
        set({ hasOnboarded: true });
      },

      exportCSV: () => {
        const { leads } = get();
        const headers = [
          "Name",
          "Phone",
          "Service",
          "Stage",
          "Source",
          "Appointment Date",
          "Follow-up Date",
          "Amount Paid",
          "Notes",
          "Referred By",
          "Created",
        ];
        const rows = leads.map((lead) => [
          lead.name,
          lead.phone,
          lead.service,
          lead.stage,
          lead.source,
          lead.appointmentDate || "",
          lead.followUpDate || "",
          lead.amountPaid?.toString() || "",
          lead.notes || "",
          lead.referredBy || "",
          lead.createdAt,
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) =>
            row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `leadflow-export-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      },
    }),
    {
      name: "leadflow-storage",
    }
  )
);
