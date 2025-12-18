/**
 * iconfont 同步脚本
 *
 * 功能：
 * 1. 读取 iconfont.json 配置
 * 2. 生成 TypeScript 类型定义
 * 3. 生成 Unicode 映射
 *
 * 使用：pnpm sync:iconfont
 */
import fs from 'fs'
import path from 'path'

interface IconFontGlyph {
  icon_id: string
  name: string
  font_class: string
  unicode: string
  unicode_decimal: number
}

interface IconFontConfig {
  id: string
  name: string
  font_family: string
  css_prefix_text: string
  description?: string
  glyphs: IconFontGlyph[]
}

const ROOT_DIR = path.resolve(__dirname, '..')
const ICONFONT_JSON_PATH = path.join(ROOT_DIR, 'src/shared/assets/iconfont/iconfont.json')
const ICON_TYPES_PATH = path.join(ROOT_DIR, 'src/shared/types/icon.ts')
const ICON_UNICODE_PATH = path.join(ROOT_DIR, 'src/shared/constants/icon-unicode.ts')

function syncIconfont() {
  console.log('🔄 开始同步 iconfont...\n')

  // 1. 读取 iconfont.json
  if (!fs.existsSync(ICONFONT_JSON_PATH)) {
    console.error('❌ 未找到 iconfont.json')
    console.error(`   路径: ${ICONFONT_JSON_PATH}`)
    console.error('   请先从 iconfont.cn 下载字体文件')
    process.exit(1)
  }

  const config: IconFontConfig = JSON.parse(fs.readFileSync(ICONFONT_JSON_PATH, 'utf-8'))
  console.log(`📦 项目: ${config.name}`)
  console.log(`📦 图标数量: ${config.glyphs.length}\n`)

  // 2. 生成 TypeScript 类型
  const iconNames = config.glyphs.map((g) => `  | '${g.font_class}'`).join('\n')

  const typeContent = `/**
 * 图标名称类型定义
 *
 * ⚠️ 自动生成，请勿手动修改
 *
 * 更新方式：
 * 1. 在 iconfont.cn 添加/修改图标
 * 2. 下载新的字体文件和 iconfont.json
 * 3. 运行 pnpm sync:iconfont
 *
 * @generated from iconfont.json
 */
export type IconName =
${iconNames}
`

  fs.writeFileSync(ICON_TYPES_PATH, typeContent)
  console.log(`✅ 已生成类型定义: src/shared/types/icon.ts`)

  // 3. 生成 Unicode 映射
  const unicodeEntries = config.glyphs
    .map((g) => `  '${g.font_class}': '\\u${g.unicode}',`)
    .join('\n')

  const unicodeContent = `/**
 * 图标 Unicode 映射
 *
 * ⚠️ 自动生成，请勿手动修改
 *
 * 更新方式：运行 pnpm sync:iconfont
 *
 * @generated from iconfont.json
 */
import type { IconName } from '../types/icon'

export const iconUnicode: Record<IconName, string> = {
${unicodeEntries}
}
`

  // 确保目录存在
  const unicodeDir = path.dirname(ICON_UNICODE_PATH)
  if (!fs.existsSync(unicodeDir)) {
    fs.mkdirSync(unicodeDir, { recursive: true })
  }

  fs.writeFileSync(ICON_UNICODE_PATH, unicodeContent)
  console.log(`✅ 已生成 Unicode 映射: src/shared/constants/icon-unicode.ts`)

  // 4. 生成 CSS 类名（可选）
  const cssContent = config.glyphs
    .map((g) => `.icon-${g.font_class}:before { content: '\\${g.unicode}'; }`)
    .join('\n')

  console.log(`\n📋 CSS 类名预览（前 5 个）:`)
  cssContent.split('\n').slice(0, 5).forEach((line) => console.log(`   ${line}`))
  console.log('   ...')

  console.log('\n🎉 iconfont 同步完成！')
  console.log('\n📝 下一步:')
  console.log('   1. 确保字体文件（ttf/woff/woff2）已放入 src/shared/assets/iconfont/')
  console.log('   2. 或配置 CDN 地址后使用 wx.loadFontFace 加载')
}

// 执行
syncIconfont()
