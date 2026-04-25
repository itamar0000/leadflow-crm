import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { Lead, LeadStage, AppointmentRecord, Settings } from "../types";
import type { ServiceType, LeadSource } from "../types";
import { supabase } from "../lib/supabase";
import { createSeedData } from "./seedData";
import toast from "react-hot-toast";

interface LeadsState {
  leads: Lead[];
  settings: Settings;
  isSeeded: boolean;
  hasOnboarded: boolean;
  loading: boolean;
  error: string | null;

  // Data loading
  fetchLeads: (userId: string) => Promise<void>;

  // Lead actions
  addLead: (
    lead: Omit<Lead, "id" | "createdAt" | "updatedAt" | "history">,
    userId: string
  ) => void;
  updateLead: (id: string, updates: Partial<Lead>, userId: string) => void;
  deleteLead: (id: string) => void;
  moveStage: (id: string, stage: LeadStage) => void;

  // Appointment actions
  addAppointment: (
    leadId: string,
    record: Omit<AppointmentRecord, "id">,
    userId: string
  ) => void;

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void;

  // Data actions
  seedData: (userId: string) => void;
  clearAll: () => void;
  setOnboarded: () => void;
  exportCSV: () => void;
}

// Settings persist separately in localStorage (not user-specific data)
function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem("leadflow-settings");
    if (raw) return JSON.parse(raw) as Settings;
  } catch {
    // ignore
  }
  return { businessName: "", ownerName: "", language: "he" };
}

function saveSettings(settings: Settings) {
  localStorage.setItem("leadflow-settings", JSON.stringify(settings));
}

function loadFlag(key: string): boolean {
  return localStorage.getItem(key) === "true";
}

function saveFlag(key: string, value: boolean) {
  localStorage.setItem(key, value ? "true" : "false");
}

// Map Supabase row → Lead model
function rowToLead(
  row: {
    id: string;
    name: string;
    phone: string;
    service: string;
    stage: string;
    source: string;
    appointment_date: string | null;
    follow_up_date: string | null;
    reminder_at: string | null;
    notes: string | null;
    referred_by: string | null;
    amount_paid: number | null;
    created_at: string;
    updated_at: string;
  },
  history: AppointmentRecord[]
): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    service: row.service as ServiceType,
    stage: row.stage as LeadStage,
    source: row.source as LeadSource,
    appointmentDate: row.appointment_date ?? undefined,
    followUpDate: row.follow_up_date ?? undefined,
    reminderAt: row.reminder_at ?? undefined,
    notes: row.notes ?? undefined,
    referredBy: row.referred_by ?? undefined,
    amountPaid: row.amount_paid != null ? Number(row.amount_paid) : undefined,
    history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const useLeadsStore = create<LeadsState>()((set, get) => ({
  leads: [],
  settings: loadSettings(),
  isSeeded: loadFlag("leadflow-seeded"),
  hasOnboarded: loadFlag("leadflow-onboarded"),
  loading: false,
  error: null,

  fetchLeads: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      // Fetch leads
      const { data: leadsData, error: leadsErr } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (leadsErr) throw leadsErr;

      // Fetch all appointment records for this user
      const { data: recordsData, error: recordsErr } = await supabase
        .from("appointment_records")
        .select("*")
        .eq("user_id", userId);

      if (recordsErr) throw recordsErr;

      // Group records by lead_id
      const recordsByLead = new Map<string, AppointmentRecord[]>();
      for (const r of recordsData ?? []) {
        const list = recordsByLead.get(r.lead_id) ?? [];
        list.push({
          id: r.id,
          date: r.date,
          service: r.service as ServiceType,
          amount: Number(r.amount),
          notes: r.notes ?? undefined,
        });
        recordsByLead.set(r.lead_id, list);
      }

      const leads = (leadsData ?? []).map((row) =>
        rowToLead(row, recordsByLead.get(row.id) ?? [])
      );

      set({ leads, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "שגיאה בטעינת הנתונים";
      set({ error: message, loading: false });
      toast.error(message);
    }
  },

  addLead: (leadData, userId) => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      id: uuidv4(),
      history: [],
      createdAt: now,
      updatedAt: now,
    };

    // Optimistic update
    set((state) => ({ leads: [newLead, ...state.leads] }));

    // Sync to Supabase
    supabase
      .from("leads")
      .insert({
        id: newLead.id,
        user_id: userId,
        name: newLead.name,
        phone: newLead.phone,
        service: newLead.service,
        stage: newLead.stage,
        source: newLead.source,
        appointment_date: newLead.appointmentDate ?? null,
        follow_up_date: newLead.followUpDate ?? null,
        reminder_at: newLead.reminderAt ?? null,
        notes: newLead.notes ?? null,
        referred_by: newLead.referredBy ?? null,
        amount_paid: newLead.amountPaid ?? null,
        created_at: now,
        updated_at: now,
      })
      .then(({ error }) => {
        if (error) {
          // Revert optimistic update
          set((state) => ({
            leads: state.leads.filter((l) => l.id !== newLead.id),
          }));
          toast.error("שגיאה בשמירת הליד");
          console.error("Supabase insert error:", error);
        }
      });
  },

  updateLead: (id, updates, _userId) => {
    // Save previous state for rollback
    const prevLeads = get().leads;

    // Optimistic update
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id
          ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
          : lead
      ),
    }));

    // Build Supabase update payload (convert camelCase → snake_case)
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.service !== undefined) payload.service = updates.service;
    if (updates.stage !== undefined) payload.stage = updates.stage;
    if (updates.source !== undefined) payload.source = updates.source;
    if (updates.appointmentDate !== undefined)
      payload.appointment_date = updates.appointmentDate ?? null;
    if (updates.followUpDate !== undefined)
      payload.follow_up_date = updates.followUpDate ?? null;
    if (updates.reminderAt !== undefined)
      payload.reminder_at = updates.reminderAt ?? null;
    if (updates.notes !== undefined) payload.notes = updates.notes ?? null;
    if (updates.referredBy !== undefined)
      payload.referred_by = updates.referredBy ?? null;
    if (updates.amountPaid !== undefined)
      payload.amount_paid = updates.amountPaid ?? null;

    if (Object.keys(payload).length > 0) {
      supabase
        .from("leads")
        .update(payload)
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            set({ leads: prevLeads });
            toast.error("שגיאה בעדכון הליד");
            console.error("Supabase update error:", error);
          }
        });
    }
  },

  deleteLead: (id) => {
    const prevLeads = get().leads;

    // Optimistic delete
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
    }));

    supabase
      .from("leads")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          set({ leads: prevLeads });
          toast.error("שגיאה במחיקת הליד");
          console.error("Supabase delete error:", error);
        }
      });
  },

  moveStage: (id, stage) => {
    const prevLeads = get().leads;

    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id
          ? { ...lead, stage, updatedAt: new Date().toISOString() }
          : lead
      ),
    }));

    supabase
      .from("leads")
      .update({ stage })
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          set({ leads: prevLeads });
          toast.error("שגיאה בהעברת שלב");
          console.error("Supabase moveStage error:", error);
        }
      });
  },

  addAppointment: (leadId, record, userId) => {
    const appointment: AppointmentRecord = {
      ...record,
      id: uuidv4(),
    };

    // Optimistic
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

    supabase
      .from("appointment_records")
      .insert({
        id: appointment.id,
        lead_id: leadId,
        user_id: userId,
        date: appointment.date,
        service: appointment.service,
        amount: appointment.amount,
        notes: appointment.notes ?? null,
      })
      .then(({ error }) => {
        if (error) {
          // Revert
          set((state) => ({
            leads: state.leads.map((lead) =>
              lead.id === leadId
                ? {
                    ...lead,
                    history: lead.history.filter(
                      (h) => h.id !== appointment.id
                    ),
                  }
                : lead
            ),
          }));
          toast.error("שגיאה בהוספת שירות");
          console.error("Supabase appointment insert error:", error);
        }
      });
  },

  updateSettings: (updates) => {
    set((state) => {
      const newSettings = { ...state.settings, ...updates };
      saveSettings(newSettings);
      return { settings: newSettings };
    });
  },

  seedData: (userId: string) => {
    const { isSeeded } = get();
    if (isSeeded) return;

    const seedLeads = createSeedData();
    set({ leads: seedLeads, isSeeded: true });
    saveFlag("leadflow-seeded", true);

    // Insert seed data to Supabase in background
    const now = new Date().toISOString();
    const leadsPayload = seedLeads.map((l) => ({
      id: l.id,
      user_id: userId,
      name: l.name,
      phone: l.phone,
      service: l.service,
      stage: l.stage,
      source: l.source,
      appointment_date: l.appointmentDate ?? null,
      follow_up_date: l.followUpDate ?? null,
      reminder_at: l.reminderAt ?? null,
      notes: l.notes ?? null,
      referred_by: l.referredBy ?? null,
      amount_paid: l.amountPaid ?? null,
      created_at: l.createdAt || now,
      updated_at: l.updatedAt || now,
    }));

    supabase.from("leads").insert(leadsPayload).then(({ error }) => {
      if (error) console.error("Seed leads insert error:", error);
    });

    // Insert seed appointment records
    const recordsPayload = seedLeads.flatMap((l) =>
      l.history.map((h) => ({
        id: h.id,
        lead_id: l.id,
        user_id: userId,
        date: h.date,
        service: h.service,
        amount: h.amount,
        notes: h.notes ?? null,
      }))
    );

    if (recordsPayload.length > 0) {
      supabase
        .from("appointment_records")
        .insert(recordsPayload)
        .then(({ error }) => {
          if (error) console.error("Seed records insert error:", error);
        });
    }
  },

  clearAll: () => {
    // Delete from Supabase — RLS ensures only user's data is deleted
    supabase.from("appointment_records").delete().neq("id", "").then(() => {
      supabase.from("leads").delete().neq("id", "");
    });

    set({ leads: [], isSeeded: false, hasOnboarded: false });
    saveFlag("leadflow-seeded", false);
    saveFlag("leadflow-onboarded", false);
  },

  setOnboarded: () => {
    set({ hasOnboarded: true });
    saveFlag("leadflow-onboarded", true);
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
      "Reminder At",
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
      lead.reminderAt || "",
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
}));
