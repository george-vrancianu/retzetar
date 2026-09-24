import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import {
  dietTypes,
  ingredients,
  user,
  userAllergicIngredients,
  userDislikedIngredients,
  userPreferredDietTypes,
  userPreferences,
  userProfiles,
} from '../database/schema';
import type { UpdateProfileInput } from './users.schemas';

type NamedReference = { id: string; name: string };
type DietaryPreferences = {
  preferredDietTypes: NamedReference[];
  allergicIngredients: NamedReference[];
  dislikedIngredients: NamedReference[];
};

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async getProfile(userId: string) {
    const [rows, dietary] = await Promise.all([
      this.database
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          displayName: userProfiles.displayName,
          bio: userProfiles.bio,
          avatarUrl: userProfiles.avatarUrl,
          locale: userPreferences.locale,
        })
        .from(user)
        .leftJoin(userProfiles, eq(userProfiles.userId, user.id))
        .leftJoin(userPreferences, eq(userPreferences.userId, user.id))
        .where(eq(user.id, userId))
        .limit(1),
      this.getDietaryPreferences(userId),
    ]);

    const profile = rows[0];
    if (!profile) throw new NotFoundException('User profile not found');

    return {
      ...profile,
      displayName: profile.displayName ?? profile.name,
      avatarUrl: profile.avatarUrl ?? profile.image,
      locale: profile.locale ?? 'en',
      dietary,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const current = await this.getProfile(userId);
    if (input.dietary) await this.validateDietaryReferences(input.dietary);

    await this.database.transaction(async (transaction) => {
      if (
        input.displayName !== undefined ||
        input.bio !== undefined ||
        input.avatarUrl !== undefined
      ) {
        await transaction
          .insert(userProfiles)
          .values({
            userId,
            displayName:
              input.displayName !== undefined
                ? input.displayName
                : current.displayName,
            bio: input.bio !== undefined ? input.bio : current.bio,
            avatarUrl:
              input.avatarUrl !== undefined
                ? input.avatarUrl
                : current.avatarUrl,
          })
          .onConflictDoUpdate({
            target: userProfiles.userId,
            set: {
              ...(input.displayName !== undefined && {
                displayName: input.displayName,
              }),
              ...(input.bio !== undefined && { bio: input.bio }),
              ...(input.avatarUrl !== undefined && {
                avatarUrl: input.avatarUrl,
              }),
              updatedAt: new Date(),
            },
          });
      }

      if (input.locale !== undefined || input.dietary !== undefined) {
        await transaction
          .insert(userPreferences)
          .values({ userId, locale: input.locale ?? current.locale })
          .onConflictDoUpdate({
            target: userPreferences.userId,
            set: {
              ...(input.locale !== undefined && { locale: input.locale }),
              updatedAt: new Date(),
            },
          });
      }

      if (input.dietary?.preferredDietTypeIds !== undefined) {
        await transaction
          .delete(userPreferredDietTypes)
          .where(eq(userPreferredDietTypes.userId, userId));
        if (input.dietary.preferredDietTypeIds.length) {
          await transaction.insert(userPreferredDietTypes).values(
            input.dietary.preferredDietTypeIds.map((dietTypeId) => ({
              userId,
              dietTypeId,
            })),
          );
        }
      }

      if (input.dietary?.allergicIngredientIds !== undefined) {
        await transaction
          .delete(userAllergicIngredients)
          .where(eq(userAllergicIngredients.userId, userId));
        if (input.dietary.allergicIngredientIds.length) {
          await transaction.insert(userAllergicIngredients).values(
            input.dietary.allergicIngredientIds.map((ingredientId) => ({
              userId,
              ingredientId,
            })),
          );
        }
      }

      if (input.dietary?.dislikedIngredientIds !== undefined) {
        await transaction
          .delete(userDislikedIngredients)
          .where(eq(userDislikedIngredients.userId, userId));
        if (input.dietary.dislikedIngredientIds.length) {
          await transaction.insert(userDislikedIngredients).values(
            input.dietary.dislikedIngredientIds.map((ingredientId) => ({
              userId,
              ingredientId,
            })),
          );
        }
      }
    });

    return this.getProfile(userId);
  }

  private async getDietaryPreferences(
    userId: string,
  ): Promise<DietaryPreferences> {
    const [preferredDietTypes, allergicIngredients, dislikedIngredients] =
      await Promise.all([
        this.database
          .select({ id: dietTypes.id, name: dietTypes.name })
          .from(userPreferredDietTypes)
          .innerJoin(
            dietTypes,
            eq(userPreferredDietTypes.dietTypeId, dietTypes.id),
          )
          .where(eq(userPreferredDietTypes.userId, userId))
          .orderBy(dietTypes.name),
        this.database
          .select({ id: ingredients.id, name: ingredients.name })
          .from(userAllergicIngredients)
          .innerJoin(
            ingredients,
            eq(userAllergicIngredients.ingredientId, ingredients.id),
          )
          .where(eq(userAllergicIngredients.userId, userId))
          .orderBy(ingredients.name),
        this.database
          .select({ id: ingredients.id, name: ingredients.name })
          .from(userDislikedIngredients)
          .innerJoin(
            ingredients,
            eq(userDislikedIngredients.ingredientId, ingredients.id),
          )
          .where(eq(userDislikedIngredients.userId, userId))
          .orderBy(ingredients.name),
      ]);

    return {
      preferredDietTypes,
      allergicIngredients,
      dislikedIngredients,
    };
  }

  private async validateDietaryReferences(
    dietary: NonNullable<UpdateProfileInput['dietary']>,
  ) {
    await Promise.all([
      dietary.preferredDietTypeIds === undefined
        ? undefined
        : this.assertDietTypesExist(dietary.preferredDietTypeIds),
      dietary.allergicIngredientIds === undefined
        ? undefined
        : this.assertIngredientsExist(dietary.allergicIngredientIds),
      dietary.dislikedIngredientIds === undefined
        ? undefined
        : this.assertIngredientsExist(dietary.dislikedIngredientIds),
    ]);
  }

  private async assertDietTypesExist(ids: string[]) {
    if (ids.length === 0) return;
    const rows = await this.database
      .select({ id: dietTypes.id })
      .from(dietTypes)
      .where(inArray(dietTypes.id, ids));
    if (rows.length !== ids.length) {
      throw new BadRequestException('One or more diet types do not exist');
    }
  }

  private async assertIngredientsExist(ids: string[]) {
    if (ids.length === 0) return;
    const rows = await this.database
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(inArray(ingredients.id, ids));
    if (rows.length !== ids.length) {
      throw new BadRequestException('One or more ingredients do not exist');
    }
  }
}
