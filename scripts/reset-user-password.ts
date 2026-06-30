import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const EMAIL = (process.argv[2] || 'kemelin@3hub.co').toLowerCase()
const NEW_PASSWORD = process.argv[3] || 'TempGlobaliza2026!'

async function main(): Promise<void> {
  const users = await prisma.users.findMany({
    select: { id: true, name: true, email: true, is_active: true, super_adm: true },
    orderBy: { id: 'asc' },
  })

  console.log('\nUsuarios no banco:')
  console.table(users)

  const user = await prisma.users.findFirst({
    where: { email: EMAIL },
  })

  if (!user) {
    console.error(`\nUsuario nao encontrado: ${EMAIL}`)
    process.exit(1)
  }

  const hash = await bcrypt.hash(NEW_PASSWORD, 10)

  await prisma.users.update({
    where: { id: user.id },
    data: {
      password: hash,
      is_active: true,
    },
  })

  console.log(`\nSenha atualizada para: ${EMAIL}`)
  console.log(`Senha temporaria: ${NEW_PASSWORD}`)
  console.log('Troque a senha apos o primeiro acesso.\n')
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
    process.exit(1)
  })
