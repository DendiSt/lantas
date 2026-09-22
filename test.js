const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const atts = await prisma.attendance.count({where: {status: "ALPHA"}});
  console.log("ALPHA:", atts);
}
main().finally(() => prisma.$disconnect());
