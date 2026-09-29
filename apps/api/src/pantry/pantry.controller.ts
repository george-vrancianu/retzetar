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
import { UsersService } from '../users/users.service';
import { ingredientsScanSchema, type IngredientsScanInput } from './ingredients-scan.schemas';
import { IngredientsScanService } from './ingredients-scan.service';
import {
  pantryIdSchema,
  pantryItemSchema,
  pantryUpdateSchema,
  type PantryItemInput,
  type PantryUpdateInput,
} from './pantry.schemas';
import { PantryService } from './pantry.service';
import { PlateScanService, plateRecipeSchema, plateScanSchema } from './plate-scan.service';
import {
  productScanSchema,
  type ProductScanInput,
} from './product-scan.schemas';
import { ProductScanService } from './product-scan.service';
import {
  receiptScanSchema,
  type ReceiptScanInput,
} from './receipt-scan.schemas';
import { ReceiptScanService } from './receipt-scan.service';

@ApiTags('pantry')
@ApiCookieAuth()
@UseGuards(AuthGuard)
@Controller('pantry')
export class PantryController {
  constructor(
    private readonly pantry: PantryService,
    private readonly productScan: ProductScanService,
    private readonly receiptScan: ReceiptScanService,
    private readonly ingredientsScan: IngredientsScanService,
    private readonly plateScan: PlateScanService,
    private readonly users: UsersService,
  ) {}

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

  @Post('scan-product')
  async scanProduct(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(productScanSchema)) input: ProductScanInput,
  ) {
    return this.productScan.analyze(input, await this.users.getLocale(user.id));
  }

  @Post('scan-receipt')
  async scanReceipt(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(receiptScanSchema)) input: ReceiptScanInput,
  ) {
    return this.receiptScan.analyze(input, await this.users.getLocale(user.id));
  }

  @Post('scan-ingredients')
  async scanIngredients(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(ingredientsScanSchema)) input: IngredientsScanInput,
  ) {
    return this.ingredientsScan.analyze(input, await this.users.getLocale(user.id));
  }

  @Post('scan-plate')
  scanPlate(@Body(new ZodValidationPipe(plateScanSchema)) input: { plateImage: string }) {
    return this.plateScan.findRecipes(input);
  }

  @Post('scan-plate/ingredients')
  scanPlateIngredients(
    @Body(new ZodValidationPipe(plateRecipeSchema)) input: { recipeTitle: string },
  ) {
    return this.plateScan.findIngredients(input.recipeTitle);
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
