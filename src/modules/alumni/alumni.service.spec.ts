import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AlumniService } from './alumni.service';

describe('AlumniService', () => {
  it('hashes passwords when creating an alumni account', async () => {
    const prisma = {
      batch: { findUnique: jest.fn().mockResolvedValue({ id: 'batch-1' }) },
      branch: { findUnique: jest.fn().mockResolvedValue({ id: 'branch-1' }) },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'alumni@example.com',
          firstName: 'Ada',
          lastName: 'Lovelace',
          phone: null,
          role: 'ALUMNI',
        }),
      },
      alumniProfile: {
        create: jest.fn().mockResolvedValue({ id: 'profile-1' }),
      },
    };

    const service = new AlumniService(prisma as any);

    await expect(
      service.createAlumni({
        email: 'alumni@example.com',
        password: 'PlainPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        batchId: 'batch-1',
        branchId: 'branch-1',
      }),
    ).resolves.toBeDefined();

    const storedPassword = prisma.user.create.mock.calls[0][0].data.password;
    expect(storedPassword).not.toBe('PlainPassword123!');
    expect(storedPassword).toMatch(/^\$2[aby]\$/);
    const isValid = await bcrypt.compare('PlainPassword123!', storedPassword);
    expect(isValid).toBe(true);
  });

  it('throws when batch or branch do not exist', async () => {
    const prisma = {
      batch: { findUnique: jest.fn().mockResolvedValue(null) },
      branch: { findUnique: jest.fn().mockResolvedValue({ id: 'branch-1' }) },
    };

    const service = new AlumniService(prisma as any);

    await expect(
      service.createAlumni({
        email: 'alumni@example.com',
        password: 'PlainPassword123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        batchId: 'batch-1',
        branchId: 'branch-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
