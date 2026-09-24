import { Module } from '@nestjs/common';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { ProductScanService } from './product-scan.service';
import { ReceiptScanService } from './receipt-scan.service';

@Module({
  controllers: [PantryController],
  providers: [PantryService, ProductScanService, ReceiptScanService],
})
export class PantryModule {}
