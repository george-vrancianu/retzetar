import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { ingredientCategories, ingredients } from '../database/schema';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import type {
  CreateAdminIngredientInput,
  UpdateAdminIngredientInput,
} from './admin-ingredients.schemas';

const normalizeName = (name: string) =>
  name.trim().replace(/\s+/g, ' ').toLowerCase();

@Injectable()
export class AdminIngredientsService {
  constructor(
    @Inject(DATABASE) private readonly database: Database,
    private readonly catalog: IngredientCatalogService,
  ) {}

  list(query: string) {
    return this.database
      .select({
        id: ingredients.id,
        name: ingredients.name,
        defaultUnit: ingredients.defaultUnit,
        categoryId: ingredientCategories.id,
        category: ingredientCategories.name,
      })
      .from(ingredients)
      .innerJoin(
        ingredientCategories,
        eq(ingredients.categoryId, ingredientCategories.id),
      )
      .where(query ? ilike(ingredients.name, `%${query}%`) : undefined)
      .orderBy(ingredients.name)
      .limit(100);
  }

  listCategories() {
    return this.database
      .select({ id: ingredientCategories.id, name: ingredientCategories.name })
      .from(ingredientCategories)
      .orderBy(ingredientCategories.name);
  }

  async createCategory(nameInput: string) {
    const name = nameInput.trim().replace(/\s+/g, ' ');
    const normalizedName = normalizeName(name);
    const existing = await this.database
      .select({ id: ingredientCategories.id })
      .from(ingredientCategories)
      .where(eq(ingredientCategories.normalizedName, normalizedName))
      .limit(1);
    if (existing[0]) {
      throw new ConflictException(
        'An ingredient category with this name exists',
      );
    }
    const rows = await this.database
      .insert(ingredientCategories)
      .values({ name, normalizedName })
      .returning({
        id: ingredientCategories.id,
        name: ingredientCategories.name,
      });
    this.catalog.invalidate();
    return rows[0];
  }

  async create(input: CreateAdminIngredientInput) {
    const name = input.name.trim().replace(/\s+/g, ' ');
    const normalizedName = normalizeName(name);
    await this.assertNameAvailable(normalizedName);
    const categoryId = input.categoryId ?? (await this.otherCategoryId());
    await this.assertCategoryExists(categoryId);
    const rows = await this.database
      .insert(ingredients)
      .values({
        name,
        normalizedName,
        defaultUnit: input.defaultUnit.trim(),
        categoryId,
      })
      .returning();
    this.catalog.invalidate();
    return rows[0];
  }

  async update(id: string, input: UpdateAdminIngredientInput) {
    const existing = await this.find(id);
    const name = input.name?.trim().replace(/\s+/g, ' ');
    const normalizedName = name ? normalizeName(name) : undefined;
    if (normalizedName && normalizedName !== existing.normalizedName) {
      await this.assertNameAvailable(normalizedName);
    }

    if (input.categoryId !== undefined) {
      await this.assertCategoryExists(input.categoryId);
    }

    const rows = await this.database
      .update(ingredients)
      .set({
        ...(name !== undefined && { name }),
        ...(normalizedName !== undefined && { normalizedName }),
        ...(input.defaultUnit !== undefined && {
          defaultUnit: input.defaultUnit.trim(),
        }),
        ...(input.categoryId !== undefined && {
          categoryId: input.categoryId,
        }),
        updatedAt: new Date(),
      })
      .where(eq(ingredients.id, id))
      .returning();
    this.catalog.invalidate();
    return rows[0];
  }

  async remove(id: string) {
    await this.find(id);
    try {
      await this.database.delete(ingredients).where(eq(ingredients.id, id));
      this.catalog.invalidate();
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23503'
      ) {
        throw new ConflictException(
          'This ingredient is in use and cannot be removed',
        );
      }
      throw error;
    }
    return { id };
  }

  private async find(id: string) {
    const rows = await this.database
      .select()
      .from(ingredients)
      .where(eq(ingredients.id, id))
      .limit(1);
    if (!rows[0]) throw new NotFoundException('Ingredient not found');
    return rows[0];
  }

  private async assertNameAvailable(normalizedName: string) {
    const rows = await this.database
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(eq(ingredients.normalizedName, normalizedName))
      .limit(1);
    if (rows[0]) {
      throw new ConflictException('An ingredient with this name exists');
    }
  }

  private async assertCategoryExists(id: string) {
    const rows = await this.database
      .select({ id: ingredientCategories.id })
      .from(ingredientCategories)
      .where(eq(ingredientCategories.id, id))
      .limit(1);
    if (!rows[0]) throw new NotFoundException('Ingredient category not found');
  }

  private async otherCategoryId() {
    const rows = await this.database
      .select({ id: ingredientCategories.id })
      .from(ingredientCategories)
      .where(eq(ingredientCategories.normalizedName, 'other'))
      .limit(1);
    if (!rows[0]) {
      throw new NotFoundException('Default ingredient category not found');
    }
    return rows[0].id;
  }
}
