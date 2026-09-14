import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as User } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  cartIdSchema,
  cartRecipeParamsSchema,
  createCartSchema,
  type CreateCartInput,
} from './carts.schemas';
import { CartsService } from './carts.service';

@ApiTags('carts')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('carts')
export class CartsController {
  constructor(private readonly carts: CartsService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(createCartSchema)) input: CreateCartInput,
  ) {
    return this.carts.create(user.id, input);
  }

  @Get()
  list(@CurrentUser() user: User) {
    return this.carts.list(user.id);
  }

  @Get(':id')
  get(
    @CurrentUser() user: User,
    @Param(new ZodValidationPipe(cartIdSchema)) params: { id: string },
  ) {
    return this.carts.get(user.id, params.id);
  }

  @Post(':id/recipes/:recipeId/missing-ingredients')
  @ApiOperation({
    summary: 'Add recipe requirements not currently in the pantry',
  })
  addMissing(
    @CurrentUser() user: User,
    @Param(new ZodValidationPipe(cartRecipeParamsSchema))
    params: {
      id: string;
      recipeId: string;
    },
  ) {
    return this.carts.addRecipeMissingIngredients(
      user.id,
      params.id,
      params.recipeId,
    );
  }
}
