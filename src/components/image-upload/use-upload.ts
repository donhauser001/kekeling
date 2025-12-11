/**
 * 图片上传 Hook
 */

import { useState, useCallback } from 'react'
import { getCookie } from '@/lib/cookies'

const API_BASE_URL = '/api'
const ACCESS_TOKEN_KEY = 'thisisjustarandomstring'

export interface UploadResult {
  url: string
  filename: string
  originalname: string
  size: number
  folder: string
}

export interface UploadState {
  progress: number
  uploading: boolean
  error: string | null
}

interface UseUploadOptions {
  folder?: string
  maxSize?: number // bytes
  accept?: string[]
  onSuccess?: (result: UploadResult) => void
  onError?: (error: string) => void
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024 // 5MB
const DEFAULT_ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

// 获取 token
const getToken = (): string | null => {
  const cookieValue = getCookie(ACCESS_TOKEN_KEY)
  if (cookieValue) {
    try {
      return JSON.parse(cookieValue)
    } catch {
      return cookieValue
    }
  }
  return null
}

export function useUpload(options: UseUploadOptions = {}) {
  const {
    folder = 'common',
    maxSize = DEFAULT_MAX_SIZE,
    accept = DEFAULT_ACCEPT,
    onSuccess,
    onError,
  } = options

  const [state, setState] = useState<UploadState>({
    progress: 0,
    uploading: false,
    error: null,
  })

  // 验证文件
  const validateFile = useCallback(
    (file: File): string | null => {
      // 检查文件类型
      if (!accept.includes(file.type)) {
        return `不支持的文件格式，请上传 ${accept.map(t => t.split('/')[1]).join('、')} 格式`
      }
      // 检查文件大小
      if (file.size > maxSize) {
        const sizeMB = (maxSize / 1024 / 1024).toFixed(0)
        return `文件大小不能超过 ${sizeMB}MB`
      }
      return null
    },
    [accept, maxSize]
  )

  // 上传单个文件
  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      // 验证
      const error = validateFile(file)
      if (error) {
        setState(prev => ({ ...prev, error }))
        onError?.(error)
        return null
      }

      setState({ progress: 0, uploading: true, error: null })

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const token = getToken()
        const headers: HeadersInit = {}
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          headers,
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`上传失败: HTTP ${response.status}`)
        }

        const result = await response.json()

        if (result.code !== 0) {
          throw new Error(result.message || '上传失败')
        }

        setState({ progress: 100, uploading: false, error: null })
        onSuccess?.(result.data)
        return result.data
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : '上传失败'
        setState({ progress: 0, uploading: false, error: errorMsg })
        onError?.(errorMsg)
        return null
      }
    },
    [folder, validateFile, onSuccess, onError]
  )

  // 上传多个文件
  const uploadFiles = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      const results: UploadResult[] = []
      for (const file of files) {
        const result = await uploadFile(file)
        if (result) {
          results.push(result)
        }
      }
      return results
    },
    [uploadFile]
  )

  // 重置状态
  const reset = useCallback(() => {
    setState({ progress: 0, uploading: false, error: null })
  }, [])

  return {
    ...state,
    uploadFile,
    uploadFiles,
    validateFile,
    reset,
  }
}
