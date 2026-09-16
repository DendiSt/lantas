import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Resetting classId for all users to null...')
  const result = await prisma.user.updateMany({
    data: { classId: null }
  })
  console.log(`Updated ${result.count} users.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
