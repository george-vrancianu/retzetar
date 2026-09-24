import { z } from 'zod';

export const imageDataUrlSchema = z
  .string()
  .max(7_000_000, 'Image is too large')
  .regex(
    /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/,
    'Image must be a JPEG, PNG, or WebP data URL',
  );

export const productScanSchema = z.object({
  productImage: imageDataUrlSchema,
  expiryImage: imageDataUrlSchema.nullable().optional(),
});

export const productScanResultSchema = z.object({
  productName: z.string().trim().min(1).max(120),
  productType: z.string().trim().min(1).max(80),
  ingredientQuery: z.string().trim().min(1).max(80),
  expiryDate: z.iso.date().nullable(),
  expiryText: z.string().trim().max(120).nullable(),
  confidence: z.number().min(0).max(1),
});

export type ProductScanInput = z.infer<typeof productScanSchema>;
export type ProductScanResult = z.infer<typeof productScanResultSchema>;

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

export function parseProductScanOutput(body: unknown): ProductScanResult {
  const response = openAIResponseSchema.parse(body);
  const outputText = response.output
    .flatMap((item) => item.content)
    .find((item) => item.type === 'output_text')?.text;
  if (!outputText) throw new Error('The image recognition result was empty');
  return productScanResultSchema.parse(JSON.parse(outputText) as unknown);
}
