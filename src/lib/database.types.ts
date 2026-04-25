export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          user_id: string;
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
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          service: string;
          stage: string;
          source: string;
          appointment_date?: string | null;
          follow_up_date?: string | null;
          reminder_at?: string | null;
          notes?: string | null;
          referred_by?: string | null;
          amount_paid?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          phone?: string;
          service?: string;
          stage?: string;
          source?: string;
          appointment_date?: string | null;
          follow_up_date?: string | null;
          reminder_at?: string | null;
          notes?: string | null;
          referred_by?: string | null;
          amount_paid?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointment_records: {
        Row: {
          id: string;
          lead_id: string;
          user_id: string;
          date: string;
          service: string;
          amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lead_id: string;
          user_id: string;
          date: string;
          service: string;
          amount: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lead_id?: string;
          user_id?: string;
          date?: string;
          service?: string;
          amount?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
