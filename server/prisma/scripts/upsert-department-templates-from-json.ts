import { PrismaClient } from '@prisma/client'
import * as fs from 'node:fs'
import * as path from 'node:path'

interface ImportRow {
  name: string
  category: string
  sort: number
}

const prisma = new PrismaClient()

async function main() {
  const dataPath = path.resolve(__dirname, '../data/department-templates-from-excel.json')
  const raw = fs.readFileSync(dataPath, 'utf-8')
  const rows = JSON.parse(raw) as ImportRow[]

  let created = 0
  let updated = 0

  for (const row of rows) {
    const existing = await prisma.departmentTemplate.findUnique({
      where: { name: row.name },
      select: { id: true },
    })

    if (existing) {
      await prisma.departmentTemplate.update({
        where: { name: row.name },
        data: {
          category: row.category,
          parentId: null,
          sort: row.sort,
          status: 'active',
        },
      })
      updated += 1
      continue
    }

    await prisma.departmentTemplate.create({
      data: {
        name: row.name,
        category: row.category,
        parentId: null,
        description: `${row.category}相关科室`,
        color: 'bg-blue-500',
        icon: 'stethoscope',
        sort: row.sort,
        status: 'active',
      },
    })
    created += 1
  }

  console.log(`科室库同步完成，总计: ${rows.length}，新增: ${created}，更新: ${updated}`)
}

main()
  .catch((err) => {
    console.error('导入失败:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
