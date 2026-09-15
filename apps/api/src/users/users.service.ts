import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { user, userPreferences, userProfiles } from '../database/schema';
import type { UpdateProfileInput } from './users.schemas';

const emptyDietary = { diets: [], allergens: [], dislikedIngredients: [] };

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly database: Database) {}

  async getProfile(userId: string) {
    const rows = await this.database
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
        avatarUrl: userProfiles.avatarUrl,
        locale: userPreferences.locale,
        dietary: userPreferences.dietary,
      })
      .from(user)
      .leftJoin(userProfiles, eq(userProfiles.userId, user.id))
      .leftJoin(userPreferences, eq(userPreferences.userId, user.id))
      .where(eq(user.id, userId))
      .limit(1);

    const profile = rows[0];
    if (!profile) throw new NotFoundException('User profile not found');

    return {
      ...profile,
      displayName: profile.displayName ?? profile.name,
      avatarUrl: profile.avatarUrl ?? profile.image,
      locale: profile.locale ?? 'en',
      dietary: profile.dietary ?? emptyDietary,
    };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const current = await this.getProfile(userId);

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
        const dietary = { ...current.dietary, ...input.dietary };
        await transaction
          .insert(userPreferences)
          .values({ userId, locale: input.locale ?? current.locale, dietary })
          .onConflictDoUpdate({
            target: userPreferences.userId,
            set: {
              ...(input.locale !== undefined && { locale: input.locale }),
              ...(input.dietary !== undefined && { dietary }),
              updatedAt: new Date(),
            },
          });
      }
    });

    return this.getProfile(userId);
  }
}
