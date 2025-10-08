const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword } = require('../services/authService');

async function main() {
  const email = 'admin@example.com';
  const password = 'password123';

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const hashedPassword = await hashPassword(password);
    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log(`Created user: ${user.email}`);
  }

  const accountsToUpdate = await prisma.whatsappAccount.findMany({
    where: { userId: null },
  });

  for (const account of accountsToUpdate) {
    await prisma.whatsappAccount.update({
      where: { id: account.id },
      data: { userId: user.id },
    });
    console.log(`Associated account ${account.wppId} with user ${user.email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
