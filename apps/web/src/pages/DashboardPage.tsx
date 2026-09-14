import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ErrorState, LoadingState } from "../components/QueryState.tsx";
import { api } from "../lib/api.ts";
import { useDashboardLayoutStore } from "../stores/dashboard-layout-store.ts";
import { FRONTEND_WIDGET_REGISTRY } from "../widgets/widget-registry.tsx";

export function DashboardPage() {
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
  const availableTypes = query.data?.registry.map(({ type }) => type) ?? [];

  useEffect(() => {
    if (query.data)
      hydrate(
        query.data.configurations,
        query.data.registry.map(({ type }) => type),
      );
  }, [hydrate, query.data]);

  const save = useMutation({
    mutationFn: () => api.saveDashboardLayout(draft),
    onSuccess: (dashboard) =>
      commit(
        dashboard.configurations,
        dashboard.registry.map(({ type }) => type),
      ),
  });

  if (query.isPending) return <LoadingState label="Building your dashboard" />;
  if (query.isError) {
    return (
      <ErrorState
        message="Your dashboard could not be loaded."
        retry={() => void query.refetch()}
      />
    );
  }

  const supported = new Set(availableTypes);
  const widgets = draft.filter(
    (configuration) =>
      (editing || configuration.enabled) &&
      supported.has(configuration.type) &&
      configuration.type in FRONTEND_WIDGET_REGISTRY,
  );

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black sm:text-4xl">
            Your kitchen at a glance
          </h1>
          <p className="mt-2 text-slate-600">Pick up where you left off.</p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              type="button"
              onClick={cancelEditing}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              type="button"
              disabled={!dirty || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving…" : "Save layout"}
            </button>
          </div>
        ) : (
          <button
            className="btn-secondary"
            type="button"
            onClick={beginEditing}
          >
            Customize dashboard
          </button>
        )}
      </div>
      {save.isError && (
        <p
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          The dashboard layout could not be saved. Your draft is still
          available.
        </p>
      )}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {widgets.map((configuration, index) => {
          const Widget = FRONTEND_WIDGET_REGISTRY[configuration.type];
          const definition = query.data.registry.find(
            ({ type }) => type === configuration.type,
          );
          return (
            <article
              className={`card ${editing && !configuration.enabled ? "opacity-60" : ""}`}
              key={configuration.id ?? configuration.type}
            >
              {editing && (
                <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                  <label className="mr-auto flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={configuration.enabled}
                      onChange={() => toggleWidget(configuration.type)}
                    />
                    Visible
                  </label>
                  <button
                    className="btn-secondary min-h-9 px-3 py-1 text-sm"
                    type="button"
                    disabled={index === 0}
                    aria-label={`Move ${definition?.title ?? configuration.type} up`}
                    onClick={() => moveWidget(configuration.type, -1)}
                  >
                    ↑
                  </button>
                  <button
                    className="btn-secondary min-h-9 px-3 py-1 text-sm"
                    type="button"
                    disabled={index === widgets.length - 1}
                    aria-label={`Move ${definition?.title ?? configuration.type} down`}
                    onClick={() => moveWidget(configuration.type, 1)}
                  >
                    ↓
                  </button>
                </div>
              )}
              <h2 className="text-xl font-bold">
                {definition?.title ?? configuration.type}
              </h2>
              <p className="mb-4 mt-1 text-sm text-slate-500">
                {definition?.description}
              </p>
              {configuration.enabled ? (
                <Widget settings={configuration.settings} />
              ) : (
                <p className="text-sm text-slate-500">This widget is hidden.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
