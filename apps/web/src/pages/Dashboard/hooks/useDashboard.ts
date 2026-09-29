import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "../../../lib/api.ts";
import { useDashboardLayoutStore } from "../../../stores/dashboard-layout-store.ts";
import { FRONTEND_WIDGET_REGISTRY } from "../../../widgets/widget-registry.tsx";

export function useDashboard() {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });
  const draft = useDashboardLayoutStore((state) => state.draft);
  const editing = useDashboardLayoutStore((state) => state.editing);
  const dirty = useDashboardLayoutStore((state) => state.dirty);
  const hydrate = useDashboardLayoutStore((state) => state.hydrate);
  const beginEditing = useDashboardLayoutStore((state) => state.beginEditing);
  const cancelEditing = useDashboardLayoutStore((state) => state.cancelEditing);
  const commit = useDashboardLayoutStore((state) => state.commit);
  const toggleWidget = useDashboardLayoutStore((state) => state.toggleWidget);
  const moveWidget = useDashboardLayoutStore((state) => state.moveWidget);

  useEffect(() => {
    if (query.data) {
      hydrate(
        query.data.configurations,
        query.data.registry.map(({ type }) => type),
      );
    }
  }, [hydrate, query.data]);

  const save = useMutation({
    mutationFn: () => api.saveDashboardLayout(draft),
    onSuccess: (dashboard) =>
      commit(
        dashboard.configurations,
        dashboard.registry.map(({ type }) => type),
      ),
  });
  const supported = new Set(query.data?.registry.map(({ type }) => type) ?? []);
  const widgets = draft.filter(
    (configuration) =>
      (editing || configuration.enabled) &&
      supported.has(configuration.type) &&
      configuration.type in FRONTEND_WIDGET_REGISTRY,
  );

  return {
    beginEditing,
    cancelEditing,
    dirty,
    editing,
    moveWidget,
    query,
    save,
    toggleWidget,
    widgets,
  };
}
