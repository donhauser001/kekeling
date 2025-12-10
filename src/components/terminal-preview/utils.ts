/**
 * 终端全局预览器工具函数
 */

// 获取资源 URL
export function getResourceUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 上传的文件直接访问，不需要 /api 前缀
  if (path.startsWith('/uploads/')) {
    return path
  }
  return path.startsWith('/') ? path : `/${path}`
}

// 提取颜色（如果是渐变取第一个颜色）
export function extractBaseColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback
  if (color.includes('gradient')) {
    return color.match(/#[a-fA-F0-9]{6}/)?.[0] || fallback
  }
  return color
}
