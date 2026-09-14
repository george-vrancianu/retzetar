import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as User } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  saveDashboardLayoutSchema,
  type SaveDashboardLayoutInput,
} from './dashboard.schemas';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get supported widgets and validated user layout' })
  get(@CurrentUser() user: User) {
    return this.dashboard.get(user.id);
  }

  @Put('layout')
  @ApiOperation({ summary: 'Replace the current user dashboard layout' })
  save(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(saveDashboardLayoutSchema))
    input: SaveDashboardLayoutInput,
  ) {
    return this.dashboard.save(user.id, input);
  }
}
