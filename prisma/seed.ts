import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Seed minimo e idempotente.
 * Cria/atualiza um usuario administrador. Use ADMIN_SEED_EMAIL e
 * ADMIN_SEED_PASSWORD para customizar; caso contrario usa os padroes abaixo.
 */
async function main(): Promise<void> {
  const email = process.env.ADMIN_SEED_EMAIL ?? 'admin@globalizacontabil.com.br'
  const password = process.env.ADMIN_SEED_PASSWORD ?? 'Admin123!'
  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.users.upsert({
    where: { email },
    create: {
      name: 'Administrador',
      email,
      password: passwordHash,
      super_adm: true,
      is_active: true,
    },
    update: {
      super_adm: true,
      is_active: true,
    },
  })

  console.log(`Seed OK: admin ${email} (senha em ADMIN_SEED_PASSWORD ou padrao Admin123!)`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    prisma.$disconnect()
    process.exit(1)
  })
