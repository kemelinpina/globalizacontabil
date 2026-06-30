import Database from 'better-sqlite3'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const SQLITE_PATH = path.join(process.cwd(), 'prisma', 'legacy', 'globaliza-dev.db')
const sqlite = new Database(SQLITE_PATH, { readonly: true })
const prisma = new PrismaClient()

const TABLES = [
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
] as const

async function pgCount(table: string): Promise<number> {
  const rows = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM "${table}"`
  )) as Array<{ c: number }>
  return rows[0].c
}

async function main(): Promise<void> {
  console.log('Comparando contagens SQLite vs Postgres:\n')
  let allMatch = true
  const report: Record<string, { sqlite: number; postgres: number; ok: string }> = {}

  for (const table of TABLES) {
    const sq = (sqlite.prepare(`SELECT COUNT(*) AS c FROM "${table}"`).get() as { c: number }).c
    const pg = await pgCount(table)
    const ok = sq === pg
    if (!ok) allMatch = false
    report[table] = { sqlite: sq, postgres: pg, ok: ok ? 'OK' : 'DIVERGENCIA' }
  }
  console.table(report)

  console.log('\nVerificando integridade referencial no Postgres:')

  const orphanPostsAuthor = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM "Posts" p LEFT JOIN "Users" u ON p.author_id = u.id WHERE u.id IS NULL`
  )) as Array<{ c: number }>
  const orphanPostsCategory = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM "Posts" p LEFT JOIN "Categories" c ON p.category_id = c.id WHERE c.id IS NULL`
  )) as Array<{ c: number }>
  const orphanPagesAuthor = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM "Pages" p LEFT JOIN "Users" u ON p.author_id = u.id WHERE u.id IS NULL`
  )) as Array<{ c: number }>
  const orphanMenuItemsMenu = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM "MenuItems" mi LEFT JOIN "Menus" m ON mi.menu_id = m.id WHERE m.id IS NULL`
  )) as Array<{ c: number }>
  const orphanMenuItemsParent = (await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS c FROM "MenuItems" mi LEFT JOIN "MenuItems" p ON mi.parent_id = p.id WHERE mi.parent_id IS NOT NULL AND p.id IS NULL`
  )) as Array<{ c: number }>

  const integrity = {
    posts_sem_autor: orphanPostsAuthor[0].c,
    posts_sem_categoria: orphanPostsCategory[0].c,
    pages_sem_autor: orphanPagesAuthor[0].c,
    menuitems_sem_menu: orphanMenuItemsMenu[0].c,
    menuitems_parent_invalido: orphanMenuItemsParent[0].c,
  }
  console.table(integrity)

  const integrityOk = Object.values(integrity).every((v) => v === 0)

  console.log('\nVerificando sequences (proximo id deve ser > max id):')
  const seqReport: Record<string, { max_id: number; proximo: number; ok: string }> = {}
  for (const table of TABLES) {
    const maxRows = (await prisma.$queryRawUnsafe(
      `SELECT COALESCE(MAX(id),0)::int AS m FROM "${table}"`
    )) as Array<{ m: number }>
    const seqNameRows = (await prisma.$queryRawUnsafe(
      `SELECT pg_get_serial_sequence('"${table}"','id') AS seq`
    )) as Array<{ seq: string }>
    const seqRows = (await prisma.$queryRawUnsafe(
      `SELECT last_value::int AS lv, is_called FROM ${seqNameRows[0].seq}`
    )) as Array<{ lv: number; is_called: boolean }>
    const maxId = maxRows[0].m
    const proximo = seqRows[0].is_called ? seqRows[0].lv + 1 : seqRows[0].lv
    const ok = maxId === 0 ? proximo >= 1 : proximo > maxId
    seqReport[table] = { max_id: maxId, proximo, ok: ok ? 'OK' : 'AJUSTAR' }
  }
  console.table(seqReport)
  const seqOk = Object.values(seqReport).every((s) => s.ok === 'OK')

  console.log('\n=== RESULTADO FINAL ===')
  console.log('Contagens:', allMatch ? 'OK (100%)' : 'DIVERGENCIA')
  console.log('Integridade FK:', integrityOk ? 'OK' : 'PROBLEMAS')
  console.log('Sequences:', seqOk ? 'OK' : 'REVISAR')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    sqlite.close()
  })
  .catch(async (err) => {
    console.error('ERRO na validacao:', err)
    await prisma.$disconnect()
    sqlite.close()
    process.exit(1)
  })
