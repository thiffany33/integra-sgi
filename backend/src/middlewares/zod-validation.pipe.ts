import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;

    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0]?.toString();
      if (field && !fields[field]) fields[field] = issue.message;
    }

    throw new BadRequestException({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request.',
        fields,
      },
    });
  }
}
