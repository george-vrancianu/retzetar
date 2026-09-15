import { saveDashboardLayoutSchema } from './dashboard.schemas';

describe('saveDashboardLayoutSchema', () => {
  it('accepts one valid configuration per registered widget', () => {
    expect(
      saveDashboardLayoutSchema.safeParse({
        configurations: [
          {
            type: 'recommended-recipes',
            position: 0,
            enabled: true,
            settings: { limit: 6 },
          },
          {
            type: 'active-cart',
            position: 1,
            enabled: false,
            settings: {},
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('rejects duplicate widget types and unsafe settings', () => {
    expect(
      saveDashboardLayoutSchema.safeParse({
        configurations: [
          { type: 'active-cart', position: 0, enabled: true, settings: {} },
          {
            type: 'active-cart',
            position: 1,
            enabled: true,
            settings: { arbitrary: 'code' },
          },
        ],
      }).success,
    ).toBe(false);
  });
});
