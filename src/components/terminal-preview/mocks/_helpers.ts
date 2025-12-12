/**
 * Mock 数据辅助函数
 * 
 * 提供通用的 mock 数据生成工具
 */

/**
 * 将列表类 mock 数据转换为空态
 */
export function getMockEmpty<T extends { items: unknown[]; total: number; hasMore?: boolean }>(
  baseMock: T
): T {
  return { ...baseMock, items: [], total: 0, hasMore: false }
}

/**
 * 生成指定金额的 mock 对象
 */
export function getMockWithAmount(amount: number): { amount: number } {
  return { amount }
}

/**
 * 生成随机 ID
 */
export function generateMockId(prefix: string = 'mock'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 生成脱敏手机号
 */
export function getMaskedPhone(phone: string = '13800138000'): string {
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

/**
 * 生成相对时间描述
 */
export function getRelativeTime(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split('T')[0]
}

