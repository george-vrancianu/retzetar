import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as User } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  pantryIdSchema,
  pantryItemSchema,
  pantryUpdateSchema,
  type PantryItemInput,
  type PantryUpdateInput,
} from './pantry.schemas';
import { PantryService } from './pantry.service';

@ApiTags('pantry')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(private readonly pantry: PantryService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.pantry.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(pantryItemSchema)) input: PantryItemInput,
  ) {
    return this.pantry.create(user.id, input);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param(new ZodValidationPipe(pantryIdSchema)) params: { id: string },
    @Body(new ZodValidationPipe(pantryUpdateSchema)) input: PantryUpdateInput,
  ) {
    return this.pantry.update(user.id, params.id, input);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: User,
    @Param(new ZodValidationPipe(pantryIdSchema)) params: { id: string },
  ) {
    return this.pantry.remove(user.id, params.id);
  }
}
