import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  adminIngredientIdSchema,
  createAdminIngredientSchema,
  createIngredientCategorySchema,
  type CreateAdminIngredientInput,
  type CreateIngredientCategoryInput,
  type UpdateAdminIngredientInput,
  updateAdminIngredientSchema,
} from './admin-ingredients.schemas';
import { AdminIngredientsService } from './admin-ingredients.service';

const querySchema = z.object({
  q: z.string().trim().max(100).default(''),
});

@ApiTags('admin')
@ApiCookieAuth()
@UseGuards(AuthGuard, AdminRoleGuard)
@Controller('admin/ingredients')
export class AdminIngredientsController {
  constructor(private readonly ingredients: AdminIngredientsService) {}

  @Get('categories')
  listCategories() {
    return this.ingredients.listCategories();
  }

  @Get()
  list(@Query(new ZodValidationPipe(querySchema)) query: { q: string }) {
    return this.ingredients.list(query.q);
  }

  @Post('categories')
  createCategory(
    @Body(new ZodValidationPipe(createIngredientCategorySchema))
    input: CreateIngredientCategoryInput,
  ) {
    return this.ingredients.createCategory(input.name);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createAdminIngredientSchema))
    input: CreateAdminIngredientInput,
  ) {
    return this.ingredients.create(input);
  }

  @Patch(':id')
  update(
    @Param(new ZodValidationPipe(adminIngredientIdSchema)) params: { id: string },
    @Body(new ZodValidationPipe(updateAdminIngredientSchema))
    input: UpdateAdminIngredientInput,
  ) {
    return this.ingredients.update(params.id, input);
  }

  @Delete(':id')
  remove(
    @Param(new ZodValidationPipe(adminIngredientIdSchema)) params: { id: string },
  ) {
    return this.ingredients.remove(params.id);
  }
}
