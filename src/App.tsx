import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Dashboard from "./pages/Dashboard.tsx";

function NavigationWrapper() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<"login" | "register">("login");

  // Keep view synchronized with auth state
  useEffect(() => {
    if (user) {
      setView("login");
    }
  }, [user]);

  if (loading) {
    return (
      <div id="root-loading" className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50/50">
        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Loading StaffSync...
        </p>
      </div>
    );
  }

  // If user is authenticated, render the dashboard
  if (user) {
    return <Dashboard />;
  }

  // Otherwise, render login/register with toggle callbacks
  return view === "login" ? (
    <Login onNavigateToRegister={() => setView("register")} />
  ) : (
    <Register onNavigateToLogin={() => setView("login")} />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationWrapper />
    </AuthProvider>
  );
}
