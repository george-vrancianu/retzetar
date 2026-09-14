import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RecipesService } from './recipes.service';

const ingredientQuerySchema = z.object({
  q: z.string().trim().max(100).default(''),
});

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly recipes: RecipesService) {}

  @Get()
  @ApiOperation({ summary: 'Find canonical ingredients for pantry management' })
  list(
    @Query(new ZodValidationPipe(ingredientQuerySchema)) query: { q: string },
  ) {
    return this.recipes.listIngredients(query.q);
  }
}
