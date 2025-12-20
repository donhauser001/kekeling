/**
 * 财务中心 API
 */

import { request, type PaginatedData } from './request'

// ============================================
// 账单管理 (基于订单的财务视图)
// ============================================

export type BillStatus = 'pending' | 'paid' | 'refunding' | 'refunded' | 'cancelled'

export interface Bill {
  id: string
  orderNo: string
  userId: string
  serviceId: string
  totalAmount: number
  paidAmount: number
  discountAmount: number
  refundAmount: number | null
  status: BillStatus
  paymentMethod: string | null
  paymentTime: string | null
  transactionId: string | null
  refundTime: string | null
  createdAt: string
  // 关联数据
  user?: {
    id: string
    nickname: string | null
    phone: string | null
  }
  service?: {
    id: string
    name: string
  }
  // 分成信息
  commissionRate: number | null
  commissionAmount: number | null
  platformAmount: number | null
}

export interface BillQuery {
  page?: number
  pageSize?: number
  status?: string
  keyword?: string
  paymentMethod?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
}

export interface BillStats {
  totalRevenue: number
  todayRevenue: number
  monthRevenue: number
  pendingAmount: number
  refundedAmount: number
  platformIncome: number
  escortIncome: number
}

// ============================================
// 收支明细 (钱包流水)
// ============================================

export type TransactionType = 'income' | 'withdraw' | 'refund' | 'frozen' | 'unfrozen'

export interface WalletTransaction {
  id: string
  walletId: string
  type: TransactionType
  amount: number
  balanceAfter: number
  orderId: string | null
  withdrawId: string | null
  title: string
  remark: string | null
  unfreezeAt: string | null
  unfrozen: boolean
  createdAt: string
  // 关联数据
  wallet?: {
    id: string
    escortId: string
    escort?: {
      id: string
      name: string
      phone: string
      avatar: string | null
    }
  }
}

export interface TransactionQuery {
  page?: number
  pageSize?: number
  type?: string
  walletId?: string
  escortId?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

export interface TransactionStats {
  totalIncome: number
  totalWithdraw: number
  totalRefund: number
  pendingUnfreeze: number
  todayIncome: number
  todayWithdraw: number
}

// ============================================
// 结算管理 (陪诊员订单结算)
// ============================================

export type SettlementStatus = 'pending' | 'frozen' | 'settled' | 'cancelled'

export interface Settlement {
  id: string
  orderId: string
  orderNo: string
  escortId: string
  escortName: string
  escortPhone: string
  serviceAmount: number
  commissionRate: number
  commissionAmount: number
  platformAmount: number
  status: SettlementStatus
  settledAt: string | null
  unfreezeAt: string | null
  createdAt: string
  // 关联订单信息
  order?: {
    id: string
    orderNo: string
    serviceName: string
    userName: string
    completedAt: string | null
  }
}

export interface SettlementQuery {
  page?: number
  pageSize?: number
  status?: string
  escortId?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

export interface SettlementStats {
  totalSettled: number
  pendingAmount: number
  frozenAmount: number
  todaySettled: number
  monthSettled: number
}

// ============================================
// 发票管理
// ============================================

export type InvoiceStatus = 'pending' | 'processing' | 'completed' | 'rejected'
export type InvoiceType = 'personal' | 'company'

export interface Invoice {
  id: string
  userId: string
  orderIds: string[]
  type: InvoiceType
  title: string
  taxNo: string | null
  amount: number
  email: string
  phone: string | null
  address: string | null
  status: InvoiceStatus
  invoiceNo: string | null
  invoiceUrl: string | null
  rejectReason: string | null
  processedAt: string | null
  createdAt: string
  // 关联数据
  user?: {
    id: string
    nickname: string | null
    phone: string | null
  }
}

export interface InvoiceQuery {
  page?: number
  pageSize?: number
  status?: string
  type?: string
  keyword?: string
  startDate?: string
  endDate?: string
}

// ============================================
// API 客户端
// ============================================

export const financeApi = {
  // ========== 账单管理 ==========
  getBills: (query: BillQuery = {}) =>
    request<PaginatedData<Bill>>('/admin/finance/bills', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getBillStats: () =>
    request<BillStats>('/admin/finance/bills/stats'),

  getBillById: (id: string) =>
    request<Bill>(`/admin/finance/bills/${id}`),

  // ========== 收支明细 ==========
  getTransactions: (query: TransactionQuery = {}) =>
    request<PaginatedData<WalletTransaction>>('/admin/finance/transactions', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getTransactionStats: () =>
    request<TransactionStats>('/admin/finance/transactions/stats'),

  // ========== 结算管理 ==========
  getSettlements: (query: SettlementQuery = {}) =>
    request<PaginatedData<Settlement>>('/admin/finance/settlements', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getSettlementStats: () =>
    request<SettlementStats>('/admin/finance/settlements/stats'),

  // ========== 发票管理 ==========
  getInvoices: (query: InvoiceQuery = {}) =>
    request<PaginatedData<Invoice>>('/admin/finance/invoices', {
      params: query as Record<string, string | number | boolean | undefined>,
    }),

  getInvoiceById: (id: string) =>
    request<Invoice>(`/admin/finance/invoices/${id}`),

  processInvoice: (id: string, data: { invoiceNo: string; invoiceUrl: string }) =>
    request<Invoice>(`/admin/finance/invoices/${id}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  rejectInvoice: (id: string, reason: string) =>
    request<Invoice>(`/admin/finance/invoices/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
}

