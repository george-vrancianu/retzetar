import { z } from 'zod';

export const WIDGET_TYPES = [
  'pantry-summary',
  'recommended-recipes',
  'favorites',
  'active-cart',
] as const;

export type WidgetType = (typeof WIDGET_TYPES)[number];

const emptySettings = z.object({}).strict();
const recommendedSettings = z.object({
  limit: z.number().int().min(1).max(12).default(4),
});

export const WIDGET_REGISTRY = {
  'pantry-summary': {
    type: 'pantry-summary',
    title: 'Pantry snapshot',
    description: 'See what is available and expiring soon.',
    settingsSchema: emptySettings,
  },
  'recommended-recipes': {
    type: 'recommended-recipes',
    title: 'Recipe inspiration',
    description: 'Discover recently published recipes.',
    settingsSchema: recommendedSettings,
  },
  favorites: {
    type: 'favorites',
    title: 'Favorites',
    description: 'Return to recipes you saved.',
    settingsSchema: emptySettings,
  },
  'active-cart': {
    type: 'active-cart',
    title: 'Active cart',
    description: 'Review the shopping list in progress.',
    settingsSchema: emptySettings,
  },
} as const satisfies Record<
  WidgetType,
  {
    type: WidgetType;
    title: string;
    description: string;
    settingsSchema: z.ZodType;
  }
>;

const widgetConfigSchema = z.object({
  id: z.uuid().optional(),
  type: z.enum(WIDGET_TYPES),
  position: z.number().int().nonnegative(),
  enabled: z.boolean(),
  settings: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]),
  ),
});

export type WidgetConfigInput = z.input<typeof widgetConfigSchema>;

const defaultConfigurations: WidgetConfigInput[] = [
  { type: 'pantry-summary', position: 0, enabled: true, settings: {} },
  {
    type: 'recommended-recipes',
    position: 1,
    enabled: true,
    settings: { limit: 4 },
  },
  { type: 'favorites', position: 2, enabled: true, settings: {} },
];

export function buildDashboardResponse(rows: unknown[]) {
  const validConfigurations = rows.flatMap((row) => {
    const parsed = widgetConfigSchema.safeParse(row);
    if (!parsed.success) return [];
    const settings = WIDGET_REGISTRY[parsed.data.type].settingsSchema.safeParse(
      parsed.data.settings,
    );
    if (!settings.success) return [];
    return [{ ...parsed.data, settings: settings.data }];
  });

  const configurations = (
    validConfigurations.length > 0 ? validConfigurations : defaultConfigurations
  ).sort((left, right) => left.position - right.position);

  return {
    registry: Object.values(WIDGET_REGISTRY).map((definition) => ({
      type: definition.type,
      title: definition.title,
      description: definition.description,
    })),
    configurations,
  };
}
