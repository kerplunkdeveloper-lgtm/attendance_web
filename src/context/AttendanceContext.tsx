"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { AttendanceTodayStatus } from "@/types";
import { attendanceApi } from "@/lib/api";
import {
  enqueuePunch,
  getAllPendingPunches,
  removePunches,
  getPendingCount,
  OfflinePunch,
} from "@/lib/offlineQueue";
import { useAuth } from "./AuthContext";
import { calculateDistanceMeters } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";

interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

type SyncStatus = "idle" | "syncing" | "synced" | "error";

export interface PunchOptions {
  workMode?: "OFFICE" | "WORK_FROM_HOME" | "CLIENT_VISIT" | "TRAVEL";
  note?: string;
}

interface AttendanceContextType {
  todayStatus: AttendanceTodayStatus | null;
  isLoading: boolean;
  isActionLoading: boolean;
  currentLocation: GeoCoordinates | null;
  locationError: string | null;
  distanceToBranch: number | null;
  isWithinGeofence: boolean;
  // Offline-aware state
  isOnline: boolean;
  pendingPunchCount: number;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  // Actions
  checkIn: (options?: PunchOptions) => Promise<boolean>;
  checkOut: (options?: PunchOptions) => Promise<boolean>;
  startBreak: () => Promise<boolean>;
  endBreak: () => Promise<boolean>;
  wfhCheckIn: (note?: string) => Promise<boolean>;
  triggerSync: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const { user, token } = useAuth();
  const [todayStatus, setTodayStatus] = useState<AttendanceTodayStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<GeoCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distanceToBranch, setDistanceToBranch] = useState<number | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean>(true);

  // ── Offline tracking ────────────────────────────────────────────────────────
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingPunchCount, setPendingPunchCount] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const isSyncingRef = useRef(false);

  // ── Refresh pending count from IndexedDB ────────────────────────────────────
  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingPunchCount(count);
  }, []);

  // ── Sync offline queue to server ────────────────────────────────────────────
  const triggerSync = useCallback(async () => {
    if (isSyncingRef.current || !token) return;
    isSyncingRef.current = true;
    setSyncStatus("syncing");

    try {
      const pending = await getAllPendingPunches();
      if (pending.length === 0) {
        setSyncStatus("idle");
        isSyncingRef.current = false;
        return;
      }

      toast.loading(`Syncing ${pending.length} offline punch${pending.length > 1 ? "es" : ""}...`, {
        id: "offline-sync",
      });

      const result = await attendanceApi.syncOffline(pending);

      // Remove punches that were synced or were already-processed duplicates (SKIPPED)
      const clearedIds = (result.results || [])
        .filter((r: any) => r.status === "SYNCED" || r.status === "SKIPPED")
        .map((r: any) => r.localId);

      if (clearedIds.length > 0) {
        await removePunches(clearedIds);
      }

      await refreshPendingCount();
      await fetchTodayStatus();

      setSyncStatus("synced");
      setLastSyncedAt(new Date());
      toast.dismiss("offline-sync");

      if (result.synced > 0) {
        toast.success(
          `✅ ${result.synced} punch${result.synced > 1 ? "es" : ""} synced to server.${result.failed > 0 ? ` (${result.failed} failed)` : ""}`
        );
      } else if (result.skipped > 0 && result.synced === 0) {
        toast.info("All offline punches were already recorded.");
      }
    } catch (err: any) {
      setSyncStatus("error");
      toast.dismiss("offline-sync");
      toast.error("Sync failed. Will retry when connection is stable.");
      console.error("Offline sync error:", err);
    } finally {
      isSyncingRef.current = false;
      // Reset to idle after 5 seconds so badge clears
      setTimeout(() => setSyncStatus((prev) => (prev === "synced" ? "idle" : prev)), 5000);
    }
  }, [token, refreshPendingCount]);

  // ── Online / offline event listeners ────────────────────────────────────────
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      toast.info("Connection restored. Syncing offline punches...", { duration: 2500 });
      // Small delay to ensure network is stable before syncing
      setTimeout(() => triggerSync(), 1500);
    };

    const onOffline = () => {
      setIsOnline(false);
      toast.warning("📴 You are offline. Punches will be saved locally and synced automatically.", {
        duration: 4000,
      });
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [triggerSync]);

  // ── Track browser GPS location ───────────────────────────────────────────────
  const updateLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setCurrentLocation(coords);
        setLocationError(null);

        const branch = user?.employee?.branch;
        if (branch && branch.latitude && branch.longitude) {
          const branchLat = typeof branch.latitude === "string" ? parseFloat(branch.latitude) : branch.latitude;
          const branchLng = typeof branch.longitude === "string" ? parseFloat(branch.longitude) : branch.longitude;
          const dist = calculateDistanceMeters(coords.latitude, coords.longitude, branchLat, branchLng);
          setDistanceToBranch(dist);
          setIsWithinGeofence(dist <= (branch.radiusMeters || 300));
        } else {
          setIsWithinGeofence(true);
        }
      },
      (error) => {
        console.warn("GPS Location Warning:", error.message);
        const defaultCoords = { latitude: 11.9344, longitude: 79.8358, accuracy: 10 };
        setCurrentLocation(defaultCoords);
        setLocationError(error.message);
        setIsWithinGeofence(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  }, [user]);

  const fetchTodayStatus = useCallback(async () => {
    if (!token || !isOnline) return;
    setIsLoading(true);
    try {
      const res = await attendanceApi.getTodayStatus();
      const raw = res?.data || res;
      if (raw) {
        const hasCheckedIn = Boolean(
          raw.hasCheckedIn ||
          raw.clockedIn ||
          raw.attendance?.checkIn
        );
        const hasCheckedOut = Boolean(
          raw.hasCheckedOut ||
          raw.attendance?.checkOut
        );
        const isOnBreak = Boolean(raw.isOnBreak);
        const isWorkFromHome = Boolean(
          raw.isWorkFromHome ||
          raw.attendance?.status === "WORK_FROM_HOME" ||
          raw.attendance?.wfhNote?.toLowerCase().includes("home")
        );

        setTodayStatus({
          hasCheckedIn,
          hasCheckedOut,
          isOnBreak,
          isWorkFromHome,
          attendance: raw.attendance,
          totalBreakMinutes: raw.totalBreakMinutes || raw.attendance?.breakMinutes || 0,
          workedMinutesToday: raw.attendance?.workingMinutes || 0,
          shift: raw.employee?.shift || raw.shift,
        });
      }
    } catch (err: any) {
      console.warn("Could not fetch today status:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token, isOnline]);

  useEffect(() => {
    if (token) {
      fetchTodayStatus();
      refreshPendingCount();
      updateLocation();
      const interval = setInterval(updateLocation, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchTodayStatus, updateLocation, refreshPendingCount]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#4f46e5", "#38bdf8", "#10b981", "#f59e0b"],
      });
    } catch {
      // ignore
    }
  };

  // ── Generic punch handler — online: call API / offline: save to IndexedDB ───
  const handlePunch = useCallback(
    async (
      type: OfflinePunch["type"],
      apiCall: () => Promise<any>,
      successMessage: string,
      coords?: GeoCoordinates
    ): Promise<boolean> => {
      setIsActionLoading(true);
      const punchTimestamp = new Date().toISOString();

      try {
        if (!isOnline) {
          // OFFLINE — save to IndexedDB
          await enqueuePunch({
            type,
            timestamp: punchTimestamp,
            latitude: coords?.latitude,
            longitude: coords?.longitude,
            accuracy: coords?.accuracy,
          });
          await refreshPendingCount();
          toast.success(`📴 ${successMessage} (saved offline — will sync when online)`, {
            duration: 4000,
          });
          // Optimistically update local UI state
          if (type === "CHECK_IN") {
            setTodayStatus((prev: any) => ({
              ...(prev || {}),
              hasCheckedIn: true,
              hasCheckedOut: false,
              checkInTime: punchTimestamp,
              isOfflinePunch: true,
            }));
          } else if (type === "CHECK_OUT") {
            setTodayStatus((prev: any) => ({
              ...(prev || {}),
              hasCheckedOut: true,
              checkOutTime: punchTimestamp,
              isOfflinePunch: true,
            }));
          } else if (type === "BREAK_START") {
            setTodayStatus((prev: any) => ({ ...(prev || {}), isOnBreak: true }));
          } else if (type === "BREAK_END") {
            setTodayStatus((prev: any) => ({ ...(prev || {}), isOnBreak: false }));
          }
          return true;
        }

        // ONLINE — call API normally
        const res = await apiCall();
        if (res?.success) {
          toast.success(res.message || successMessage);
          triggerCelebration();
          await fetchTodayStatus();
          return true;
        }
        toast.error(res?.message || `${type} failed`);
        return false;
      } catch (err: any) {
        // Network error while "online" — save offline as fallback
        if (!navigator.onLine || err.code === "ERR_NETWORK" || err.message?.includes("Network")) {
          await enqueuePunch({
            type,
            timestamp: punchTimestamp,
            latitude: coords?.latitude,
            longitude: coords?.longitude,
            accuracy: coords?.accuracy,
          });
          await refreshPendingCount();
          toast.warning(`📴 Network error — ${successMessage} saved offline.`, { duration: 4000 });
          return true;
        }
        toast.error(err.response?.data?.message || err.message || `${type} failed`);
        return false;
      } finally {
        setIsActionLoading(false);
      }
    },
    [isOnline, fetchTodayStatus, refreshPendingCount]
  );

  // ── Individual punch actions ─────────────────────────────────────────────────

  const checkIn = useCallback(
    async (options?: PunchOptions): Promise<boolean> => {
      const coords = currentLocation || { latitude: 11.9344, longitude: 79.8358, accuracy: 15 };
      return handlePunch(
        "CHECK_IN",
        () => attendanceApi.checkIn({ ...coords, ...options }),
        options?.workMode === "WORK_FROM_HOME"
          ? "WFH Clock-in recorded!"
          : options?.workMode === "CLIENT_VISIT"
          ? "Client Visit Clock-in recorded!"
          : options?.workMode === "TRAVEL"
          ? "Travel Clock-in recorded!"
          : "Clock-in recorded!",
        coords
      );
    },
    [currentLocation, handlePunch]
  );

  const checkOut = useCallback(
    async (options?: PunchOptions): Promise<boolean> => {
      const coords = currentLocation || { latitude: 11.9344, longitude: 79.8358, accuracy: 15 };
      return handlePunch(
        "CHECK_OUT",
        () => attendanceApi.checkOut({ ...coords, ...options }),
        "Clock-out recorded!",
        coords
      );
    },
    [currentLocation, handlePunch]
  );

  const startBreak = useCallback(async (): Promise<boolean> => {
    const coords = currentLocation
      ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      : undefined;
    return handlePunch(
      "BREAK_START",
      () => attendanceApi.startBreak(coords),
      "Break started!",
      coords
        ? { latitude: coords.latitude, longitude: coords.longitude }
        : undefined
    );
  }, [currentLocation, handlePunch]);

  const endBreak = useCallback(async (): Promise<boolean> => {
    const coords = currentLocation
      ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
      : undefined;
    return handlePunch(
      "BREAK_END",
      () => attendanceApi.endBreak(coords),
      "Break ended!",
      coords
        ? { latitude: coords.latitude, longitude: coords.longitude }
        : undefined
    );
  }, [currentLocation, handlePunch]);

  const wfhCheckIn = useCallback(async (note?: string): Promise<boolean> => {
    setIsActionLoading(true);
    const punchTimestamp = new Date().toISOString();
    try {
      if (!isOnline) {
        await enqueuePunch({ type: "WFH_CHECK_IN", timestamp: punchTimestamp, wfhNote: note });
        await refreshPendingCount();
        setTodayStatus((prev: any) => ({
          ...(prev || {}),
          hasCheckedIn: true,
          isWorkFromHome: true,
          isOfflinePunch: true,
        }));
        toast.success("📴 WFH Clock-in saved offline — will sync automatically.", { duration: 4000 });
        return true;
      }
      const res = await attendanceApi.wfhCheckIn(note);
      if (res?.success) {
        toast.success("Remote WFH Clock-in successful!");
        triggerCelebration();
        await fetchTodayStatus();
        return true;
      }
      toast.error(res?.message || "WFH check-in failed");
      return false;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "WFH check-in failed");
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [isOnline, fetchTodayStatus, refreshPendingCount]);

  return (
    <AttendanceContext.Provider
      value={{
        todayStatus,
        isLoading,
        isActionLoading,
        currentLocation,
        locationError,
        distanceToBranch,
        isWithinGeofence,
        isOnline,
        pendingPunchCount,
        syncStatus,
        lastSyncedAt,
        checkIn,
        checkOut,
        startBreak,
        endBreak,
        wfhCheckIn,
        triggerSync,
        refreshStatus: fetchTodayStatus,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
};
