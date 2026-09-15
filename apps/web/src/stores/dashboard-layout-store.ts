import { create } from "zustand";
import type { DashboardConfiguration, WidgetType } from "../lib/api.ts";

const cloneConfigurations = (configurations: DashboardConfiguration[]) =>
  configurations
    .map((configuration) => ({
      ...configuration,
      settings: { ...configuration.settings },
    }))
    .sort((left, right) => left.position - right.position)
    .map((configuration, position) => ({ ...configuration, position }));

const completeConfigurations = (
  configurations: DashboardConfiguration[],
  availableTypes: WidgetType[],
) => {
  const configuredTypes = new Set(configurations.map(({ type }) => type));
  const missing = availableTypes
    .filter((type) => !configuredTypes.has(type))
    .map((type, index) => ({
      type,
      position: configurations.length + index,
      enabled: false,
      settings: {},
    }));
  return cloneConfigurations([...configurations, ...missing]);
};

type DashboardLayoutState = {
  baseline: DashboardConfiguration[];
  draft: DashboardConfiguration[];
  editing: boolean;
  dirty: boolean;
  hydrate: (
    configurations: DashboardConfiguration[],
    availableTypes: WidgetType[],
  ) => void;
  beginEditing: () => void;
  cancelEditing: () => void;
  commit: (
    configurations: DashboardConfiguration[],
    availableTypes: WidgetType[],
  ) => void;
  toggleWidget: (type: WidgetType) => void;
  moveWidget: (type: WidgetType, direction: -1 | 1) => void;
};

export const useDashboardLayoutStore = create<DashboardLayoutState>((set) => ({
  baseline: [],
  draft: [],
  editing: false,
  dirty: false,
  hydrate: (configurations, availableTypes) => {
    const completed = completeConfigurations(configurations, availableTypes);
    set((state) =>
      state.editing && state.dirty
        ? state
        : {
            baseline: completed,
            draft: completed,
            editing: false,
            dirty: false,
          },
    );
  },
  beginEditing: () => set({ editing: true }),
  cancelEditing: () =>
    set((state) => ({
      draft: cloneConfigurations(state.baseline),
      editing: false,
      dirty: false,
    })),
  commit: (configurations, availableTypes) => {
    const completed = completeConfigurations(configurations, availableTypes);
    set({
      baseline: completed,
      draft: completed,
      editing: false,
      dirty: false,
    });
  },
  toggleWidget: (type) =>
    set((state) => ({
      draft: state.draft.map((configuration) =>
        configuration.type === type
          ? { ...configuration, enabled: !configuration.enabled }
          : configuration,
      ),
      dirty: true,
    })),
  moveWidget: (type, direction) =>
    set((state) => {
      const draft = cloneConfigurations(state.draft);
      const currentIndex = draft.findIndex(
        (configuration) => configuration.type === type,
      );
      const destination = currentIndex + direction;
      if (currentIndex < 0 || destination < 0 || destination >= draft.length)
        return state;
      [draft[currentIndex], draft[destination]] = [
        draft[destination],
        draft[currentIndex],
      ];
      return {
        draft: draft.map((configuration, position) => ({
          ...configuration,
          position,
        })),
        dirty: true,
      };
    }),
}));
