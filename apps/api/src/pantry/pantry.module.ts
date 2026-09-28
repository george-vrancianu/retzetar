import { Module } from '@nestjs/common';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { UsersModule } from '../users/users.module';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { ProductScanService } from './product-scan.service';
import { ReceiptScanService } from './receipt-scan.service';

@Module({
  imports: [IngredientCatalogModule, UsersModule],
  controllers: [PantryController],
  providers: [PantryService, ProductScanService, ReceiptScanService],
})
export class PantryModule {}
