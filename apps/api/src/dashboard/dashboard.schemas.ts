import { z } from 'zod';
import { WIDGET_REGISTRY, WIDGET_TYPES } from './widget-registry';

const layoutItemSchema = z.object({
  type: z.enum(WIDGET_TYPES),
  position: z.number().int().nonnegative(),
  enabled: z.boolean(),
  settings: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]),
  ),
});

export const saveDashboardLayoutSchema = z.object({
  configurations: z
    .array(layoutItemSchema)
    .min(1)
    .max(WIDGET_TYPES.length)
    .superRefine((configurations, context) => {
      const types = new Set<string>();
      const positions = new Set<number>();

      configurations.forEach((configuration, index) => {
        if (types.has(configuration.type)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'type'],
            message: 'Widget types must be unique',
          });
        }
        if (positions.has(configuration.position)) {
          context.addIssue({
            code: 'custom',
            path: [index, 'position'],
            message: 'Widget positions must be unique',
          });
        }
        types.add(configuration.type);
        positions.add(configuration.position);

        const settings = WIDGET_REGISTRY[
          configuration.type
        ].settingsSchema.safeParse(configuration.settings);
        if (!settings.success) {
          context.addIssue({
            code: 'custom',
            path: [index, 'settings'],
            message: 'Widget settings are invalid',
          });
        }
      });
    }),
});

export type SaveDashboardLayoutInput = z.infer<
  typeof saveDashboardLayoutSchema
>;
