import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useLeadsStore } from "./store/useLeadsStore";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";
import AddLeadSheet from "./components/AddLeadSheet";
import Home from "./pages/Home";
import Pipeline from "./pages/Pipeline";
import Clients from "./pages/Clients";
import Revenue from "./pages/Revenue";
import Settings from "./pages/Settings";
import ClientProfile from "./components/ClientProfile";

export default function App() {
  const hasOnboarded = useLeadsStore((s) => s.hasOnboarded);
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <BrowserRouter>
      {/* Onboarding overlay */}
      {!hasOnboarded && <Onboarding />}

      {/* Main app */}
      <div className="flex-1 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/client/:id" element={<ClientProfile />} />
        </Routes>
      </div>

      {/* Bottom navigation */}
      <BottomNav />

      {/* FAB - Add Lead */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed z-50 bottom-20 end-4 w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center active:scale-90 transition-transform hover:shadow-xl"
        aria-label="Add lead"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add Lead bottom sheet */}
      <AddLeadSheet isOpen={showAddSheet} onClose={() => setShowAddSheet(false)} />

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "12px",
            background: "#292524",
            color: "#fff",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#f43f5e",
              secondary: "#fff",
            },
          },
        }}
      />
    </BrowserRouter>
  );
}
