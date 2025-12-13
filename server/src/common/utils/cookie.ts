/**
 * Cookie 工具函数
 *
 * ⚠️ 安全修复（P1-9）：
 * - 使用 httpOnly Cookie 存储 JWT Token
 * - 防止 XSS 攻击窃取 Token
 *
 * @see docs/终端预览器集成/安全审计报告-2024-12-13.md - P1-9
 */

import { Response } from 'express';

/**
 * Token Cookie 配置
 */
export const TOKEN_COOKIE_OPTIONS = {
  /** Cookie 名称 */
  name: 'kekeling_token',

  /** httpOnly: 禁止 JavaScript 访问 */
  httpOnly: true,

  /** secure: 仅 HTTPS 传输（生产环境） */
  secure: process.env.NODE_ENV === 'production',

  /** sameSite: 防止 CSRF */
  sameSite: 'lax' as const,

  /** path: Cookie 作用路径 */
  path: '/',

  /** maxAge: 7 天（毫秒） */
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * 管理员 Token Cookie 配置
 */
export const ADMIN_TOKEN_COOKIE_OPTIONS = {
  ...TOKEN_COOKIE_OPTIONS,
  name: 'kekeling_admin_token',
  /** 管理员 Token 有效期较短：1 天 */
  maxAge: 24 * 60 * 60 * 1000,
};

/**
 * 设置 Token Cookie
 */
export function setTokenCookie(
  res: Response,
  token: string,
  isAdmin = false,
): void {
  const options = isAdmin ? ADMIN_TOKEN_COOKIE_OPTIONS : TOKEN_COOKIE_OPTIONS;

  res.cookie(options.name, token, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
    maxAge: options.maxAge,
  });
}

/**
 * 清除 Token Cookie
 */
export function clearTokenCookie(res: Response, isAdmin = false): void {
  const name = isAdmin
    ? ADMIN_TOKEN_COOKIE_OPTIONS.name
    : TOKEN_COOKIE_OPTIONS.name;

  res.clearCookie(name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * 从请求中提取 Token
 * 优先级：Authorization Header > Cookie
 */
export function extractToken(req: {
  headers: { authorization?: string };
  cookies?: Record<string, string>;
}): string | null {
  // 1. 从 Authorization Header 提取（Bearer Token）
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. 从 Cookie 提取
  if (req.cookies) {
    // 优先检查管理员 Token
    if (req.cookies[ADMIN_TOKEN_COOKIE_OPTIONS.name]) {
      return req.cookies[ADMIN_TOKEN_COOKIE_OPTIONS.name];
    }
    // 检查用户 Token
    if (req.cookies[TOKEN_COOKIE_OPTIONS.name]) {
      return req.cookies[TOKEN_COOKIE_OPTIONS.name];
    }
  }

  return null;
}

