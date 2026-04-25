import { useState, useEffect, Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./lib/auth";
import { useLeadsStore } from "./store/useLeadsStore";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";
import AddLeadSheet from "./components/AddLeadSheet";
import Home from "./pages/Home";
import Pipeline from "./pages/Pipeline";
import Clients from "./pages/Clients";
import Revenue from "./pages/Revenue";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import ClientProfile from "./components/ClientProfile";

// ─── Error Boundary ────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">😢</span>
          </div>
          <h2 className="text-lg font-bold text-warm-800 mb-2">
            אופס, משהו השתבש
          </h2>
          <p className="text-warm-500 text-sm mb-4 max-w-xs">
            קרתה שגיאה לא צפויה. נסי לרענן את הדף.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-6 py-2.5 rounded-xl bg-rose-500 text-white font-medium text-sm"
          >
            נסי שוב
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Loading Skeleton ──────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="pb-24 pt-safe animate-pulse">
      <div className="px-5 pt-4 pb-5">
        <div className="h-4 bg-warm-200 rounded w-24 mb-2" />
        <div className="h-7 bg-warm-200 rounded w-36" />
      </div>
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 card-shadow border border-warm-100 h-24"
            >
              <div className="w-9 h-9 bg-warm-100 rounded-xl mb-3" />
              <div className="h-5 bg-warm-100 rounded w-12 mb-1" />
              <div className="h-3 bg-warm-100 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-warm-100 rounded-2xl h-20" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-3.5 card-shadow border border-warm-100 flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-full bg-warm-100 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-warm-100 rounded w-28 mb-1.5" />
                <div className="h-3 bg-warm-100 rounded w-40" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Authenticated App Shell ───────────────────────────
function AppShell() {
  const { user, loading: authLoading } = useAuth();
  const hasOnboarded = useLeadsStore((s) => s.hasOnboarded);
  const storeLoading = useLeadsStore((s) => s.loading);
  const fetchLeads = useLeadsStore((s) => s.fetchLeads);
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Fetch leads when user is authenticated
  useEffect(() => {
    if (user) {
      fetchLeads(user.id);
    }
  }, [user, fetchLeads]);

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl">💇‍♀️</span>
          </div>
          <div className="w-6 h-6 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      {/* Onboarding overlay */}
      {!hasOnboarded && <Onboarding />}

      {/* Main app */}
      <div className="flex-1 pb-16">
        <ErrorBoundary>
          {storeLoading ? (
            <LoadingSkeleton />
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/revenue" element={<Revenue />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/client/:id" element={<ClientProfile />} />
            </Routes>
          )}
        </ErrorBoundary>
      </div>

      {/* Bottom navigation */}
      <BottomNav />

      {/* FAB - Add Lead */}
      <button
        onClick={() => setShowAddSheet(true)}
        className="fixed z-50 bottom-20 end-4 w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center active:scale-90 transition-transform hover:shadow-xl"
        aria-label="Add lead"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      {/* Add Lead bottom sheet */}
      <AddLeadSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
      />

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

// ─── Root App ──────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
