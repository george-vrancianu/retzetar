import { Module } from '@nestjs/common';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { RecipesModule } from '../recipes/recipes.module';
import { UsersModule } from '../users/users.module';
import { IngredientsScanService } from './ingredients-scan.service';
import { PlateScanService } from './plate-scan.service';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { ProductScanService } from './product-scan.service';
import { ReceiptScanService } from './receipt-scan.service';

@Module({
  imports: [IngredientCatalogModule, RecipesModule, UsersModule],
  controllers: [PantryController],
  providers: [
    StructuredOutputAiService,
    PantryService,
    ProductScanService,
    ReceiptScanService,
    IngredientsScanService,
    PlateScanService,
  ],
})
export class PantryModule {}
