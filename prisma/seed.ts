import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create batches (2007-2025)
  const batches: Array<{ id: string; year: number }> = [];
  for (let year = 2007; year <= 2025; year++) {
    const batch = await prisma.batch.upsert({
      where: { year },
      update: {},
      create: {
        year,
        name: `Batch ${year}`,
        season: year % 2 === 0 ? 'Fall' : 'Spring',
      },
    });
    batches.push(batch);
  }
  console.log(`✅ Created ${batches.length} batches`);

  // Create branches
  const branches = [
    { name: 'Douala', code: 'DL', description: 'Douala Regional Branch' },
    { name: 'Yaoundé', code: 'YD', description: 'Yaoundé Regional Branch' },
    { name: 'Bamenda', code: 'BM', description: 'Bamenda Regional Branch' },
    { name: 'Buea', code: 'BU', description: 'Buea Regional Branch' },
    { name: 'Limbe', code: 'LB', description: 'Limbe Regional Branch' },
    { name: 'Kumba', code: 'KB', description: 'Kumba Regional Branch' },
    { name: 'International', code: 'INT', description: 'International Alumni Branch' },
  ];

  for (const branchData of branches) {
    await prisma.branch.upsert({
      where: { name: branchData.name },
      update: {},
      create: branchData,
    });
  }
  console.log(`✅ Created ${branches.length} branches`);

  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL ?? 'admin@jopesa.org';
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? 'admin123';

  // Create test users and alumni profiles
  const testUsers = [
    {
      email: defaultAdminEmail,
      password: defaultAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      phone: '+237 6XX XXX XXX',
      batchYear: 2010,
      branchName: 'Yaoundé',
      bio: 'System Administrator for JOPESA',
      currentRole: 'Administrator',
      currentCompany: 'JOPESA',
      location: 'Yaoundé, Cameroon',
    },
    {
      email: 'john.doe@jopesa.org',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.ALUMNI,
      phone: '+237 6XX XXX XXX',
      batchYear: 2015,
      branchName: 'Douala',
      bio: 'Software Engineer passionate about technology',
      currentRole: 'Senior Software Engineer',
      currentCompany: 'Tech Corp',
      location: 'Douala, Cameroon',
      linkedIn: 'https://linkedin.com/in/johndoe',
      twitter: '@johndoe',
    },
    {
      email: 'jane.smith@jopesa.org',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.ALUMNI,
      phone: '+237 6XX XXX XXX',
      batchYear: 2018,
      branchName: 'Bamenda',
      bio: 'Civil Engineer building the future',
      currentRole: 'Project Manager',
      currentCompany: 'Construction Ltd',
      location: 'Bamenda, Cameroon',
      linkedIn: 'https://linkedin.com/in/janesmith',
    },
    {
      email: 'mike.johnson@jopesa.org',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Johnson',
      role: UserRole.MEMBER,
      phone: '+237 6XX XXX XXX',
      batchYear: 2020,
      branchName: 'Buea',
      bio: 'Recent graduate exploring opportunities',
      currentRole: 'Junior Developer',
      currentCompany: 'Startup Inc',
      location: 'Buea, Cameroon',
    },
  ];

  for (const userData of testUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
      },
    });

    const batch = batches.find(b => b.year === userData.batchYear);
    const branch = await prisma.branch.findUnique({ where: { name: userData.branchName } });

    if (batch && branch) {
      await prisma.alumniProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          batchId: batch.id,
          branchId: branch.id,
          bio: userData.bio,
          currentRole: userData.currentRole,
          currentCompany: userData.currentCompany,
          location: userData.location,
          linkedIn: userData.linkedIn,
          twitter: userData.twitter,
          isVerified: userData.role === UserRole.ADMIN,
        },
      });
    }
  }
  console.log(`✅ Created ${testUsers.length} test users with alumni profiles`);

  // Create sample announcements
  const announcements = [
    {
      title: 'Welcome to JOPESA Connect',
      content: 'We are excited to launch our new digital platform connecting all JOPACC alumni worldwide.',
      type: 'NEWS' as const,
      isPinned: true,
    },
    {
      title: 'Annual Reunion 2026',
      content: 'Mark your calendars! The annual alumni reunion will be held in Yaoundé on June 15-16, 2026.',
      type: 'EVENT' as const,
      isPinned: false,
    },
    {
      title: 'Job Opportunities',
      content: 'Several alumni have shared exciting job opportunities. Check the community posts for details.',
      type: 'OPPORTUNITY' as const,
      isPinned: false,
    },
  ];

  for (const ann of announcements) {
    await prisma.announcement.create({
      data: {
        ...ann,
        publishedAt: new Date(),
      },
    });
  }
  console.log(`✅ Created ${announcements.length} sample announcements`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });