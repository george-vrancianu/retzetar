import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import {
  parseProductScanOutput,
  type ProductScanInput,
  type ProductScanResult,
} from './product-scan.schemas';

@Injectable()
export class ProductScanService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async analyze(input: ProductScanInput): Promise<ProductScanResult> {
    const apiKey = this.config.get('OPENAI_API_KEY', { infer: true });
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Product scanning is not configured. Set OPENAI_API_KEY on the API server.',
      );
    }

    const content: Array<Record<string, unknown>> = [
      {
        type: 'input_text',
        text: [
          'Analyze these grocery package photos.',
          'The first image shows the product. Identify its display name, broad product type, and a short generic ingredient search term (for example, "Greek yogurt" becomes "Yogurt").',
          'If a second image is present, it shows the printed expiry or best-before area. Read only a clearly visible expiry/best-before/use-by date.',
          'Return expiryDate as YYYY-MM-DD only when the date is unambiguous. Otherwise return null. Do not mistake batch/lot codes or production dates for expiry dates.',
          'Confidence is the overall confidence from 0 to 1.',
        ].join(' '),
      },
      { type: 'input_image', image_url: input.productImage, detail: 'high' },
    ];
    if (input.expiryImage) {
      content.push({
        type: 'input_image',
        image_url: input.expiryImage,
        detail: 'high',
      });
    }

    let response: Response;
    try {
      response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.get('OPENAI_VISION_MODEL', { infer: true }),
          store: false,
          input: [{ role: 'user', content }],
          text: {
            format: {
              type: 'json_schema',
              name: 'grocery_product_scan',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  productName: { type: 'string' },
                  productType: { type: 'string' },
                  ingredientQuery: { type: 'string' },
                  expiryDate: { type: ['string', 'null'] },
                  expiryText: { type: ['string', 'null'] },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                },
                required: [
                  'productName',
                  'productType',
                  'ingredientQuery',
                  'expiryDate',
                  'expiryText',
                  'confidence',
                ],
              },
            },
          },
          max_output_tokens: 400,
        }),
      });
    } catch {
      throw new BadGatewayException(
        'The image recognition service is unavailable',
      );
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `The image recognition service returned ${response.status}`,
      );
    }

    try {
      return parseProductScanOutput(await response.json());
    } catch {
      throw new BadGatewayException('The image recognition result was invalid');
    }
  }
}
