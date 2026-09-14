import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  recipeIdSchema,
  recipeQuerySchema,
  type RecipeQuery,
} from './recipes.schemas';
import { RecipesService } from './recipes.service';

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  @ApiOperation({ summary: 'List or search published recipes' })
  list(@Query(new ZodValidationPipe(recipeQuerySchema)) query: RecipeQuery) {
    return this.recipes.list(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a published recipe with ingredients and steps',
  })
  get(@Param(new ZodValidationPipe(recipeIdSchema)) params: { id: string }) {
    return this.recipes.get(params.id);
  }
}
