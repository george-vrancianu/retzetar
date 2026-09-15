import { buildDashboardResponse, WIDGET_REGISTRY } from './widget-registry';

describe('dashboard widget registry', () => {
  it('returns only supported configurations with valid settings in position order', () => {
    const dashboard = buildDashboardResponse([
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'recommended-recipes',
        position: 2,
        enabled: true,
        settings: { limit: 6 },
      },
      { type: 'arbitrary-code', position: 0, enabled: true, settings: {} },
      {
        type: 'active-cart',
        position: 1,
        enabled: true,
        settings: { unsafe: 'x' },
      },
      { type: 'favorites', position: 0, enabled: true, settings: {} },
    ]);

    expect(dashboard.configurations.map(({ type }) => type)).toEqual([
      'favorites',
      'recommended-recipes',
    ]);
    expect(dashboard.registry).toHaveLength(
      Object.keys(WIDGET_REGISTRY).length,
    );
    expect(
      dashboard.registry.every((widget) => !('settingsSchema' in widget)),
    ).toBe(true);
  });

  it('uses a safe default layout when no saved configuration is valid', () => {
    expect(buildDashboardResponse([]).configurations).toHaveLength(3);
  });
});
