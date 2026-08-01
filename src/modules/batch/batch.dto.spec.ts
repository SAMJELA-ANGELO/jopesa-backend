import { ValidationPipe } from '@nestjs/common';
import { UpdateBatchDto } from './dto/batch.dto';

describe('UpdateBatchDto validation', () => {
  it('accepts year updates for batch edits', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    await expect(
      pipe.transform(
        {
          year: 2026,
          name: 'Batch 2026',
          season: 'Spring',
        },
        {
          type: 'body',
          metatype: UpdateBatchDto,
        },
      ),
    ).resolves.toMatchObject({
      year: 2026,
      name: 'Batch 2026',
      season: 'Spring',
    });
  });
});
