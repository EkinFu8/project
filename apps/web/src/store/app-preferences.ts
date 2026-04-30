import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DashboardTab = "overview" | "metrics" | "tags";

type AppPreferencesState = {
  coworkerSearch: string;
  usersSearch: string;
  tagsSearch: string;
  dashboardTab: DashboardTab;
  heroExpanded: boolean;
};

type AppPreferencesActions = {
  setCoworkerSearch: (search: string) => void;
  setUsersSearch: (search: string) => void;
  setTagsSearch: (search: string) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  setHeroExpanded: (expanded: boolean) => void;
};

type AppPreferences = AppPreferencesState & AppPreferencesActions;

const DEFAULT_PREFERENCES: AppPreferencesState = {
  coworkerSearch: "",
  usersSearch: "",
  tagsSearch: "",
  dashboardTab: "overview",
  heroExpanded: true,
};

export const useAppPreferences = create<AppPreferences>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setCoworkerSearch: (coworkerSearch) => set({ coworkerSearch }),
      setUsersSearch: (usersSearch) => set({ usersSearch }),
      setTagsSearch: (tagsSearch) => set({ tagsSearch }),
      setDashboardTab: (dashboardTab) => set({ dashboardTab }),
      setHeroExpanded: (heroExpanded) => set({ heroExpanded }),
    }),
    {
      name: "app.preferences.v1",
      partialize: ({ coworkerSearch, usersSearch, tagsSearch, dashboardTab, heroExpanded }) => ({
        coworkerSearch,
        usersSearch,
        tagsSearch,
        dashboardTab,
        heroExpanded,
      }),
    },
  ),
);
