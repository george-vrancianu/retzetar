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
  scanProduct(
    @Body(new ZodValidationPipe(productScanSchema)) input: ProductScanInput,
  ) {
    return this.productScan.analyze(input);
  }

  @Post('scan-receipt')
  scanReceipt(
    @Body(new ZodValidationPipe(receiptScanSchema)) input: ReceiptScanInput,
  ) {
    return this.receiptScan.analyze(input);
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
