import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 陪诊员等级对象类型
 */
export interface EscortLevelVO {
  code: string       // 'senior' - 用于逻辑判断
  name: string       // '资深陪诊员' - 用于直接展示
  sortOrder?: number // 排序权重
  badgeColor?: string // 颜色配置
}

/**
 * 等级 Code 到 Name 的映射表
 * 用于后端返回字符串时的兜底转换
 */
const LEVEL_NAME_MAP: Record<string, string> = {
  senior: '资深',
  intermediate: '中级',
  junior: '初级',
  trainee: '实习',
}

/**
 * 等级 Code 到颜色的映射表
 */
const LEVEL_COLOR_MAP: Record<string, string> = {
  senior: '#722ED1',      // 紫色
  intermediate: '#1890FF', // 蓝色
  junior: '#52C41A',       // 绿色
  trainee: '#8C8C8C',      // 灰色
}

/**
 * 标准化陪诊员等级字段
 *
 * 后端可能返回字符串（'senior'）或对象（{ code, name }），
 * 此函数统一转换为对象格式，确保前端渲染一致性。
 *
 * @param level - 后端返回的 level 字段（可能是字符串或对象）
 * @returns 标准化后的等级对象
 *
 * @example
 * normalizeLevel('senior')
 * // => { code: 'senior', name: '资深', badgeColor: '#722ED1' }
 *
 * normalizeLevel({ code: 'junior', name: '初级陪诊员' })
 * // => { code: 'junior', name: '初级陪诊员', badgeColor: '#52C41A' }
 */
export function normalizeLevel(
  level: string | EscortLevelVO | null | undefined
): EscortLevelVO {
  // 空值兜底
  if (!level) {
    return { code: 'unknown', name: '未知', badgeColor: '#8C8C8C' }
  }

  // 字符串类型：转换为对象
  if (typeof level === 'string') {
    return {
      code: level,
      name: LEVEL_NAME_MAP[level] || level,
      badgeColor: LEVEL_COLOR_MAP[level] || '#8C8C8C',
    }
  }

  // 对象类型：补充缺失的颜色
  return {
    ...level,
    badgeColor: level.badgeColor || LEVEL_COLOR_MAP[level.code] || '#8C8C8C',
  }
}

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}
