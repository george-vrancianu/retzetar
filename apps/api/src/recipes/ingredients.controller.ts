import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RecipesService } from './recipes.service';

const ingredientQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
});

@ApiTags('reference data')
@Controller()
export class IngredientsController {
  constructor(private readonly recipes: RecipesService) {}

  @Get('diet-types')
  @ApiOperation({ summary: 'List canonical diet types' })
  listDietTypes() {
    return this.recipes.listDietTypes();
  }

  @Get('ingredients')
  @ApiOperation({ summary: 'Find canonical ingredients for pantry management' })
  list(
    @Query(new ZodValidationPipe(ingredientQuerySchema)) query: { q: string },
  ) {
    return this.recipes.listIngredients(query.q);
  }
}
