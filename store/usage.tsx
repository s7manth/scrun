import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type TrackedAppId =
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'x'
  | 'facebook'
  | 'youtube'
  | 'snapchat'
  | 'reddit'
  | 'pinterest';

export type TrackedApp = {
  id: TrackedAppId;
  label: string;
};

export type DailyUsage = {
  dateISO: string; // YYYY-MM-DD
  scrollMinutes: number;
  runMinutes: number;
};

type UsageState = {
  trackedApps: TrackedAppId[];
  // keyed by date ISO for simplicity
  byDate: Record<string, DailyUsage>;
};

type UsageActions = {
  toggleTrackedApp: (appId: TrackedAppId) => void;
  addScrollMinutes: (dateISO: string, minutes: number) => void;
  addRunMinutes: (dateISO: string, minutes: number) => void;
  getDay: (dateISO: string) => DailyUsage;
};

const initialState: UsageState = {
  trackedApps: ['instagram', 'tiktok', 'twitter'],
  byDate: {},
};

const UsageContext = createContext<(UsageState & UsageActions) | null>(null);

export const DEFAULT_APPS: TrackedApp[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'x', label: 'X' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'snapchat', label: 'Snapchat' },
  { id: 'reddit', label: 'Reddit' },
  { id: 'pinterest', label: 'Pinterest' },
];

function coerceDay(existing: DailyUsage | undefined, dateISO: string): DailyUsage {
  if (existing) return existing;
  return { dateISO, scrollMinutes: 0, runMinutes: 0 };
}

export function UsageProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UsageState>(initialState);

  const toggleTrackedApp = useCallback((appId: TrackedAppId) => {
    setState((prev) => {
      const isTracked = prev.trackedApps.includes(appId);
      return {
        ...prev,
        trackedApps: isTracked
          ? prev.trackedApps.filter((a) => a !== appId)
          : [...prev.trackedApps, appId],
      };
    });
  }, []);

  const addScrollMinutes = useCallback((dateISO: string, minutes: number) => {
    const delta = Math.max(0, Math.floor(minutes));
    if (!delta) return;
    setState((prev) => {
      const existing = prev.byDate[dateISO];
      const next = coerceDay(existing, dateISO);
      next.scrollMinutes += delta;
      return { ...prev, byDate: { ...prev.byDate, [dateISO]: { ...next } } };
    });
  }, []);

  const addRunMinutes = useCallback((dateISO: string, minutes: number) => {
    const delta = Math.max(0, Math.floor(minutes));
    if (!delta) return;
    setState((prev) => {
      const existing = prev.byDate[dateISO];
      const next = coerceDay(existing, dateISO);
      next.runMinutes += delta;
      return { ...prev, byDate: { ...prev.byDate, [dateISO]: { ...next } } };
    });
  }, []);

  const getDay = useCallback(
    (dateISO: string): DailyUsage => {
      return coerceDay(state.byDate[dateISO], dateISO);
    },
    [state.byDate]
  );

  const value = useMemo(
    () => ({
      ...state,
      toggleTrackedApp,
      addScrollMinutes,
      addRunMinutes,
      getDay,
    }),
    [state, toggleTrackedApp, addScrollMinutes, addRunMinutes, getDay]
  );

  return <UsageContext.Provider value={value}>{children}</UsageContext.Provider>;
}

export function useUsage() {
  const ctx = useContext(UsageContext);
  if (!ctx) throw new Error('useUsage must be used within UsageProvider');
  return ctx;
}

export function getTodayISO(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTomorrowISO(date = new Date()): string {
  const t = new Date(date);
  t.setDate(t.getDate() + 1);
  return getTodayISO(t);
}


