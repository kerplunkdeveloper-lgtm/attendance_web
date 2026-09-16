"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, UserRole } from "@/types";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (payload: any) => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemoRole: (role: "ADMIN" | "MANAGER" | "EMPLOYEE") => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const loadUser = async (authToken?: string) => {
    try {
      const activeToken = authToken || localStorage.getItem("workpulse_access_token");
      if (!activeToken) {
        setIsLoading(false);
        return;
      }
      setToken(activeToken);
      const res = await authApi.getMe();
      const userData = res?.user || res?.data;
      if (res?.success && userData) {
        setUser(userData);
        localStorage.setItem("workpulse_user", JSON.stringify(userData));
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      localStorage.removeItem("workpulse_access_token");
      localStorage.removeItem("workpulse_user");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      if (res?.success && (res?.data?.accessToken || res?.data?.token)) {
        const receivedToken = res.data.accessToken || res.data.token;
        const loggedUser = res.data.user;

        localStorage.setItem("workpulse_access_token", receivedToken);
        localStorage.setItem("workpulse_user", JSON.stringify(loggedUser));

        setToken(receivedToken);
        setUser(loggedUser);
        toast.success(`Welcome back, ${loggedUser.employee?.firstName || loggedUser.email}!`);

        if (loggedUser.mustChangePassword) {
          toast.info("Please set a new secure password to activate your account.");
          router.push("/change-password");
        } else {
          router.push("/dashboard");
        }
        return true;
      } else {
        toast.error(res?.message || "Login failed");
        return false;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to log in");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(payload);
      if (res?.success) {
        const receivedToken = res.data?.accessToken || res.data?.token;
        const newUser = res.data?.user;

        if (receivedToken) {
          localStorage.setItem("workpulse_access_token", receivedToken);
          localStorage.setItem("workpulse_user", JSON.stringify(newUser));
          setToken(receivedToken);
          setUser(newUser);
        }

        if (newUser?.planLocked) {
          toast.success("Organization created! Check your email for your Plan Unlock Code.", { duration: 6000 });
        } else {
          toast.success("Organization & Account registered successfully!");
        }
        router.push("/dashboard");
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("workpulse_access_token");
      localStorage.removeItem("workpulse_user");
      setUser(null);
      setToken(null);
      toast.info("Logged out successfully");
      router.push("/login");
    }
  };

  // Quick switch between pre-seeded demo accounts for instant testing
  const switchDemoRole = async (targetRole: "ADMIN" | "MANAGER" | "EMPLOYEE") => {
    let email = "admin@workpulse.com";
    if (targetRole === "MANAGER") email = "manager@workpulse.com";
    if (targetRole === "EMPLOYEE") email = "employee@workpulse.com";

    toast.loading(`Switching to ${targetRole} role...`, { id: "demo-switch" });
    const success = await login(email, "Password@123");
    toast.dismiss("demo-switch");
    if (success) {
      toast.success(`Active persona switched to ${targetRole}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser: () => loadUser(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
