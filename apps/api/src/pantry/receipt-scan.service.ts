import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import {
  parseReceiptScanOutput,
  type ReceiptScanInput,
  type ReceiptScanResult,
} from './receipt-scan.schemas';

@Injectable()
export class ReceiptScanService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async analyze(input: ReceiptScanInput): Promise<ReceiptScanResult> {
    const apiKey = this.config.get('OPENAI_API_KEY', { infer: true });
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Receipt scanning is not configured. Set OPENAI_API_KEY on the API server.',
      );
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
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: [
                    'Read this shopping receipt in one pass and extract only edible grocery and beverage purchases that belong in a home pantry.',
                    'Exclude household supplies, cosmetics, medicine, tobacco, bags, bottle deposits, fees, discounts, coupons, subtotals, taxes, totals, and payment lines.',
                    'Expand abbreviated receipt labels into a concise consumer-facing productName when the text supports it; do not invent products.',
                    'For productType use a broad food category. For ingredientQuery return the short generic ingredient name most likely to match a cooking ingredient catalog (for example, Greek yogurt becomes Yogurt).',
                    'Use the purchased line quantity when visible, otherwise 1. Use a short pantry unit such as item, g, kg, ml, or l; infer package size only when it is printed in the line.',
                    'Return the purchase date as YYYY-MM-DD only when unambiguous. Confidence is per item from 0 to 1.',
                  ].join(' '),
                },
                {
                  type: 'input_image',
                  image_url: input.receiptImage,
                  detail: 'high',
                },
              ],
            },
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'grocery_receipt_scan',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  merchantName: { type: ['string', 'null'] },
                  purchaseDate: { type: ['string', 'null'] },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      properties: {
                        productName: { type: 'string' },
                        productType: { type: 'string' },
                        ingredientQuery: { type: 'string' },
                        quantity: { type: 'number' },
                        unit: { type: 'string' },
                        confidence: {
                          type: 'number',
                          minimum: 0,
                          maximum: 1,
                        },
                      },
                      required: [
                        'productName',
                        'productType',
                        'ingredientQuery',
                        'quantity',
                        'unit',
                        'confidence',
                      ],
                    },
                  },
                },
                required: ['merchantName', 'purchaseDate', 'items'],
              },
            },
          },
          max_output_tokens: 2_500,
        }),
      });
    } catch {
      throw new BadGatewayException(
        'The receipt recognition service is unavailable',
      );
    }

    if (!response.ok) {
      throw new BadGatewayException(
        `The receipt recognition service returned ${response.status}`,
      );
    }

    try {
      return parseReceiptScanOutput(await response.json());
    } catch {
      throw new BadGatewayException('The receipt recognition result was invalid');
    }
  }
}
