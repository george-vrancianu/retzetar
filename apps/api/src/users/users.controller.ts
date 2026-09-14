import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as User } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { updateProfileSchema, type UpdateProfileInput } from './users.schemas';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() currentUser: User) {
    return this.users.getProfile(currentUser.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() currentUser: User,
    @Body(new ZodValidationPipe(updateProfileSchema)) input: UpdateProfileInput,
  ) {
    return this.users.updateProfile(currentUser.id, input);
  }
}
