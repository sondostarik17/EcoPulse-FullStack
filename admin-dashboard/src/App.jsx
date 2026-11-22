
import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

const AUTH_URL = "http://localhost:5000/api/auth/me";

// Loading Screen
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060908]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />

        <p className="mt-4 text-sm text-gray-400">
          Checking administrator access...
        </p>
      </div>
    </div>
  );
}

// Protected Dashboard Layout
function ProtectedLayout({ authStatus }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (authStatus === "checking") {
    return <LoadingScreen />;
  }

  // No session or normal user: go to admin login
  if (
    authStatus === "unauthenticated" ||
    authStatus === "not-admin"
  ) {
    return <Navigate to="/login" replace />;
  }

  // Only admins can see dashboard pages
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#0b0b10] dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">

        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="min-w-0 flex-1">
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
          />

          <div className="p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/users" element={<Users />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

// Main App Content
function AppContent() {
  const [authStatus, setAuthStatus] = useState("checking");

  // Check current session and admin role
  const checkAdminSession = useCallback(async () => {
    try {
      const response = await fetch(AUTH_URL, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        setAuthStatus("unauthenticated");
        return;
      }

      const data = await response.json();

      if (data.success && data.user?.role === "admin") {
        setAuthStatus("admin");
      } else if (data.success && data.user?.role === "user") {
        setAuthStatus("not-admin");
      } else {
        setAuthStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Admin session check failed:", error);
      setAuthStatus("unauthenticated");
    }
  }, []);

  // Initial check + listen for login/logout changes
  useEffect(() => {
    checkAdminSession();

    const handleAuthChanged = () => {
      checkAdminSession();
    };

    window.addEventListener("authChanged", handleAuthChanged);

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChanged
      );
    };
  }, [checkAdminSession]);

  return (
    <Routes>
      {/* Admin Login */}
      <Route
        path="/login"
        element={
          authStatus === "checking" ? (
            <LoadingScreen />
          ) : authStatus === "admin" ? (
            <Navigate to="/" replace />
          ) : (
            <Login
              accessDenied={authStatus === "not-admin"}
            />
          )
        }
      />

      {/* Protected Admin Dashboard */}
      <Route
        path="/*"
        element={
          <ProtectedLayout authStatus={authStatus} />
        }
      />
    </Routes>
  );
}

// Main App
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
