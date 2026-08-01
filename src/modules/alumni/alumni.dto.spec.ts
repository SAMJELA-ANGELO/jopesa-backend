import { ValidationPipe } from '@nestjs/common';
import { CreateAlumniDto } from './dto/alumni.dto';

describe('CreateAlumniDto validation', () => {
  it('accepts international phone numbers without strict region rules', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    await expect(
      pipe.transform(
        {
          email: 'test@example.com',
          password: 'StrongPass123!',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '237674818818',
          batchId: 'batch_123',
          branchId: 'branch_123',
        },
        {
          type: 'body',
          metatype: CreateAlumniDto,
        },
      ),
    ).resolves.toMatchObject({
      phone: '237674818818',
    });

    await expect(
      pipe.transform(
        {
          email: 'test2@example.com',
          password: 'StrongPass123!',
          firstName: 'Jane',
          lastName: 'Doe',
          phone: '674818818',
          batchId: 'batch_123',
          branchId: 'branch_123',
        },
        {
          type: 'body',
          metatype: CreateAlumniDto,
        },
      ),
    ).resolves.toMatchObject({
      phone: '674818818',
    });
  });
});
