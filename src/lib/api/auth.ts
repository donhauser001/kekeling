/**
 * 管理员认证 API
 */

import { request } from './request'

export interface AdminLoginResponse {
  token: string
  admin: {
    id: string
    username: string
    name: string
    email: string | null
    role: string
  }
}

export const authApi = {
  // 管理员登录
  adminLogin: (username: string, password: string) =>
    request<AdminLoginResponse>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
}
