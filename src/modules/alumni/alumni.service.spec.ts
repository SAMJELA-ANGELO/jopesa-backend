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

  it('builds a public alumni directory list with computed membership badges', async () => {
    const prisma = {
      alumniProfile: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'profile-1',
            bio: 'Engineer',
            profileImage: 'https://example.com/a.jpg',
            currentRole: 'Senior Engineer',
            currentCompany: 'JOPESA',
            location: 'Yaounde',
            linkedIn: 'https://linkedin.com/in/ada',
            website: 'https://ada.dev',
            userId: 'user-1',
            batchId: 'batch-1',
            branchId: 'branch-1',
            user: {
              id: 'user-1',
              email: 'ada@example.com',
              firstName: 'Ada',
              lastName: 'Lovelace',
              phone: '+237600000001',
              role: 'ALUMNI',
              contributionPayments: [
                {
                  contribution: { type: 'ANNUAL_FEE', title: 'Annual fee' },
                  paymentDate: '2026-05-01T00:00:00.000Z',
                  status: 'COMPLETED',
                },
              ],
            },
            batch: { id: 'batch-1', name: 'Batch 2020' },
            branch: { id: 'branch-1', name: 'Douala' },
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
        findUnique: jest.fn().mockResolvedValue({
          id: 'profile-1',
          bio: 'Engineer',
          profileImage: 'https://example.com/a.jpg',
          currentRole: 'Senior Engineer',
          currentCompany: 'JOPESA',
          location: 'Yaounde',
          linkedIn: 'https://linkedin.com/in/ada',
          website: 'https://ada.dev',
          userId: 'user-1',
          batchId: 'batch-1',
          branchId: 'branch-1',
          user: {
            id: 'user-1',
            email: 'ada@example.com',
            firstName: 'Ada',
            lastName: 'Lovelace',
            phone: '+237600000001',
            role: 'ALUMNI',
            contributionPayments: [
              {
                contribution: { type: 'ANNUAL_FEE', title: 'Annual fee' },
                paymentDate: '2026-05-01T00:00:00.000Z',
                status: 'COMPLETED',
              },
            ],
          },
          batch: { id: 'batch-1', name: 'Batch 2020' },
          branch: { id: 'branch-1', name: 'Douala' },
        }),
      },
    };

    const service = new AlumniService(prisma as any);

    const result = await service.getDirectoryMembers();

    expect(result.data).toHaveLength(1);
    expect(result.data[0].membershipBadge).toBe('ACTIVE');
    expect(result.data[0].user.email).toBe('ada@example.com');
  });

  it('returns a public alumni detail record with a computed membership badge', async () => {
    const prisma = {
      alumniProfile: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'profile-1',
          bio: 'Engineer',
          profileImage: 'https://example.com/a.jpg',
          currentRole: 'Senior Engineer',
          currentCompany: 'JOPESA',
          location: 'Yaounde',
          linkedIn: 'https://linkedin.com/in/ada',
          website: 'https://ada.dev',
          userId: 'user-1',
          batchId: 'batch-1',
          branchId: 'branch-1',
          user: {
            id: 'user-1',
            email: 'ada@example.com',
            firstName: 'Ada',
            lastName: 'Lovelace',
            phone: '+237600000001',
            role: 'ALUMNI',
            contributionPayments: [
              {
                contribution: { type: 'ANNUAL_FEE', title: 'Annual fee' },
                paymentDate: '2026-04-20T00:00:00.000Z',
                status: 'PENDING',
              },
            ],
          },
          batch: { id: 'batch-1', name: 'Batch 2020' },
          branch: { id: 'branch-1', name: 'Douala' },
        }),
      },
    };

    const service = new AlumniService(prisma as any);

    const result = await service.getPublicMemberById('profile-1');

    expect(result.membershipBadge).toBe('PASSIVE');
    expect(result.user.fullName).toBe('Ada Lovelace');
  });
});
