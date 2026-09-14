import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  FlexCol,
  FlexRow,
  Grid,
  Heading,
  Page,
  PageHeader,
  Text,
} from "@retzetar/ui";
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
    <Page>
      <PageHeader>
        <FlexCol gap="none">
          <Heading>Your kitchen at a glance</Heading>
          <Text className="mt-2" variant="muted">
            Pick up where you left off.
          </Text>
        </FlexCol>
        {editing ? (
          <FlexRow gap="sm">
            <Button variant="secondary" type="button" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!dirty || save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving…" : "Save layout"}
            </Button>
          </FlexRow>
        ) : (
          <Button variant="secondary" type="button" onClick={beginEditing}>
            Customize dashboard
          </Button>
        )}
      </PageHeader>
      {save.isError && (
        <Alert className="mt-4">
          The dashboard layout could not be saved. Your draft is still
          available.
        </Alert>
      )}
      <Grid variant="two" className="mt-8">
        {widgets.map((configuration, index) => {
          const Widget = FRONTEND_WIDGET_REGISTRY[configuration.type];
          const definition = query.data.registry.find(
            ({ type }) => type === configuration.type,
          );
          return (
            <Card
              as="article"
              className={editing && !configuration.enabled ? "opacity-60" : ""}
              key={configuration.id ?? configuration.type}
            >
              {editing && (
                <FlexRow
                  wrap
                  gap="sm"
                  className="mb-4 border-b border-slate-100 pb-4"
                >
                  <Checkbox
                    className="mr-auto"
                    label="Visible"
                    checked={configuration.enabled}
                    onChange={() => toggleWidget(configuration.type)}
                  />
                  <Button
                    variant="secondary"
                    size="small"
                    type="button"
                    disabled={index === 0}
                    aria-label={`Move ${definition?.title ?? configuration.type} up`}
                    onClick={() => moveWidget(configuration.type, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    type="button"
                    disabled={index === widgets.length - 1}
                    aria-label={`Move ${definition?.title ?? configuration.type} down`}
                    onClick={() => moveWidget(configuration.type, 1)}
                  >
                    ↓
                  </Button>
                </FlexRow>
              )}
              <Heading level={2} variant="card">
                {definition?.title ?? configuration.type}
              </Heading>
              <Text className="mb-4 mt-1" variant="subtle">
                {definition?.description}
              </Text>
              {configuration.enabled ? (
                <Widget settings={configuration.settings} />
              ) : (
                <Text variant="subtle">This widget is hidden.</Text>
              )}
            </Card>
          );
        })}
      </Grid>
    </Page>
  );
}
