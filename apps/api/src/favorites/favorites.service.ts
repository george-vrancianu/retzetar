import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { favoriteRecipes, recipes } from '../database/schema';

@Injectable()
export class FavoritesService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  list(userId: string) {
    return this.database
      .select({ recipe: recipes, favoritedAt: favoriteRecipes.createdAt })
      .from(favoriteRecipes)
      .innerJoin(recipes, eq(favoriteRecipes.recipeId, recipes.id))
      .where(eq(favoriteRecipes.userId, userId))
      .orderBy(desc(favoriteRecipes.createdAt));
  }

  async add(userId: string, recipeId: string) {
    const recipe = await this.database
      .select({ id: recipes.id })
      .from(recipes)
      .where(and(eq(recipes.id, recipeId), eq(recipes.published, true)))
      .limit(1);
    if (!recipe[0]) throw new NotFoundException('Recipe not found');

    await this.database
      .insert(favoriteRecipes)
      .values({ userId, recipeId })
      .onConflictDoNothing();
    return { recipeId, favorited: true };
  }

  async remove(userId: string, recipeId: string) {
    const rows = await this.database
      .delete(favoriteRecipes)
      .where(
        and(
          eq(favoriteRecipes.userId, userId),
          eq(favoriteRecipes.recipeId, recipeId),
        ),
      )
      .returning({ recipeId: favoriteRecipes.recipeId });
    if (!rows[0]) throw new NotFoundException('Favorite not found');
    return { recipeId, favorited: false };
  }
}
