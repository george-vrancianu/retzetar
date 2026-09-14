import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

@Injectable()
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Request validation failed',
        issues: result.error.issues.map(({ path, message, code }) => ({
          path: path.join('.'),
          message,
          code,
        })),
      });
    }
    return result.data;
  }
}
