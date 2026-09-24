import { z } from 'zod';
import { imageDataUrlSchema } from './product-scan.schemas';

export const receiptScanSchema = z.object({
  receiptImage: imageDataUrlSchema,
});

export const receiptScanItemSchema = z.object({
  productName: z.string().trim().min(1).max(120),
  productType: z.string().trim().min(1).max(80),
  ingredientQuery: z.string().trim().min(1).max(80),
  quantity: z.number().positive().max(10_000),
  unit: z.string().trim().min(1).max(30),
  confidence: z.number().min(0).max(1),
});

export const receiptScanResultSchema = z.object({
  merchantName: z.string().trim().max(120).nullable(),
  purchaseDate: z.iso.date().nullable(),
  items: z.array(receiptScanItemSchema).max(100),
});

export type ReceiptScanInput = z.infer<typeof receiptScanSchema>;
export type ReceiptScanResult = z.infer<typeof receiptScanResultSchema>;

const openAIResponseSchema = z.object({
  output: z.array(
    z.object({
      content: z.array(
        z.object({
          type: z.string(),
          text: z.string().optional(),
        }),
      ),
    }),
  ),
});

export function parseReceiptScanOutput(body: unknown): ReceiptScanResult {
  const response = openAIResponseSchema.parse(body);
  const outputText = response.output
    .flatMap((item) => item.content)
    .find((item) => item.type === 'output_text')?.text;
  if (!outputText) throw new Error('The receipt recognition result was empty');
  return receiptScanResultSchema.parse(JSON.parse(outputText) as unknown);
}
