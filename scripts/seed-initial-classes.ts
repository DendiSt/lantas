import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const classNames = [
    '10 A', '10 B', '10 C',
    '11 A', '11 B', '11 C',
    '12 A', '12 B', '12 C'
  ]

  console.log('Seeding initial classes...')
  for (const name of classNames) {
    await prisma.class.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
