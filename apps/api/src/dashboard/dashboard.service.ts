import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { dashboardWidgets } from '../database/schema';
import type { SaveDashboardLayoutInput } from './dashboard.schemas';
import { buildDashboardResponse } from './widget-registry';

@Injectable()
export class DashboardService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async get(userId: string) {
    const rows = await this.database
      .select({
        id: dashboardWidgets.id,
        type: dashboardWidgets.type,
        position: dashboardWidgets.position,
        enabled: dashboardWidgets.enabled,
        settings: dashboardWidgets.settings,
      })
      .from(dashboardWidgets)
      .where(eq(dashboardWidgets.userId, userId));

    return buildDashboardResponse(rows);
  }

  async save(userId: string, input: SaveDashboardLayoutInput) {
    await this.database.transaction(async (transaction) => {
      await transaction
        .delete(dashboardWidgets)
        .where(eq(dashboardWidgets.userId, userId));
      await transaction.insert(dashboardWidgets).values(
        input.configurations.map((configuration) => ({
          ...configuration,
          userId,
        })),
      );
    });

    return this.get(userId);
  }
}
