import Database from 'better-sqlite3'
import path from 'path'
import { PrismaClient } from '@prisma/client'

/**
 * Migracao de dados SQLite -> PostgreSQL para a Globaliza Contabil.
 * Le o banco legado em modo readonly e insere no Postgres preservando os IDs.
 * Idempotente: limpa as tabelas de destino antes de inserir.
 */

const SQLITE_PATH = path.join(process.cwd(), 'prisma', 'legacy', 'globaliza-dev.db')

const BOOL_COLUMNS = new Set(['is_active', 'super_adm', 'is_featured', 'is_pinned'])
const DATE_COLUMNS = new Set(['created_at', 'updated_at', 'published_at'])

type Row = Record<string, unknown>

function toDate(value: unknown): Date {
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') {
    const direct = new Date(value)
    if (!Number.isNaN(direct.getTime())) return direct
    const normalized = new Date(value.replace(' ', 'T') + (value.includes('Z') ? '' : 'Z'))
    if (!Number.isNaN(normalized.getTime())) return normalized
  }
  throw new Error(`Valor de data invalido: ${JSON.stringify(value)}`)
}

function transformRow(row: Row): Row {
  const out: Row = {}
  for (const [key, value] of Object.entries(row)) {
    if (value === null || value === undefined) {
      out[key] = null
    } else if (BOOL_COLUMNS.has(key)) {
      out[key] = Boolean(value)
    } else if (DATE_COLUMNS.has(key)) {
      out[key] = toDate(value)
    } else {
      out[key] = value
    }
  }
  return out
}

const sqlite = new Database(SQLITE_PATH, { readonly: true })
const prisma = new PrismaClient()

function read(table: string): Row[] {
  return (sqlite.prepare(`SELECT * FROM "${table}" ORDER BY id ASC`).all() as Row[]).map(transformRow)
}

async function main(): Promise<void> {
  console.log('Lendo dados do SQLite legado...')

  const users = read('Users')
  const categories = read('Categories')
  const posts = read('Posts')
  const pages = read('Pages')
  const menus = read('Menus')
  const menuItems = read('MenuItems')
  const contacts = read('Contacts')
  const files = read('Files')
  const homeAbout = read('HomeAbout')
  const bannerWhatsApp = read('BannerWhatsApp')
  const logs = read('Logs')

  console.log('Limpando tabelas de destino no Postgres...')
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Logs","MenuItems","Menus","Contacts","Files","HomeAbout","BannerWhatsApp","Pages","Posts","Categories","Users" RESTART IDENTITY CASCADE;`
  )

  console.log('Inserindo dados (preservando IDs)...')

  await prisma.users.createMany({ data: users as never })
  await prisma.categories.createMany({ data: categories as never })
  await prisma.posts.createMany({ data: posts as never })
  await prisma.pages.createMany({ data: pages as never })
  await prisma.menus.createMany({ data: menus as never })

  // MenuItems tem auto-relacao (parent_id). Insere sem parent e depois atualiza.
  const menuItemsNoParent = menuItems.map((m) => ({ ...m, parent_id: null }))
  await prisma.menuItems.createMany({ data: menuItemsNoParent as never })
  for (const item of menuItems) {
    if (item.parent_id !== null) {
      await prisma.menuItems.update({
        where: { id: item.id as number },
        data: { parent_id: item.parent_id as number },
      })
    }
  }

  await prisma.contacts.createMany({ data: contacts as never })
  await prisma.files.createMany({ data: files as never })
  await prisma.homeAbout.createMany({ data: homeAbout as never })
  await prisma.bannerWhatsApp.createMany({ data: bannerWhatsApp as never })
  await prisma.logs.createMany({ data: logs as never })

  console.log('Ajustando sequences...')
  const tables = [
    'Users',
    'Categories',
    'Posts',
    'Pages',
    'Menus',
    'MenuItems',
    'Contacts',
    'Files',
    'HomeAbout',
    'BannerWhatsApp',
    'Logs',
  ]
  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1), (SELECT COUNT(*) > 0 FROM "${table}"));`
    )
  }

  console.log('\nMigracao concluida. Contagens no Postgres:')
  const counts: Record<string, number> = {
    Users: await prisma.users.count(),
    Categories: await prisma.categories.count(),
    Posts: await prisma.posts.count(),
    Pages: await prisma.pages.count(),
    Menus: await prisma.menus.count(),
    MenuItems: await prisma.menuItems.count(),
    Contacts: await prisma.contacts.count(),
    Files: await prisma.files.count(),
    HomeAbout: await prisma.homeAbout.count(),
    BannerWhatsApp: await prisma.bannerWhatsApp.count(),
    Logs: await prisma.logs.count(),
  }
  console.table(counts)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    sqlite.close()
  })
  .catch(async (err) => {
    console.error('ERRO na migracao:', err)
    await prisma.$disconnect()
    sqlite.close()
    process.exit(1)
  })
