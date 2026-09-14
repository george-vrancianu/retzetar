import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as User } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { recipeIdSchema } from '../recipes/recipes.schemas';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.favorites.list(user.id);
  }

  @Post(':id')
  add(
    @CurrentUser() user: User,
    @Param(new ZodValidationPipe(recipeIdSchema)) params: { id: string },
  ) {
    return this.favorites.add(user.id, params.id);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param(new ZodValidationPipe(recipeIdSchema)) params: { id: string },
  ) {
    return this.favorites.remove(user.id, params.id);
  }
}
