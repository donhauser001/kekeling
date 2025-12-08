/**
 * 云开发 API 封装
 * 备案通过后，可替换为 HTTP 请求
 */
import Taro from '@tarojs/taro'

// 初始化云开发
export function initCloud() {
  if (process.env.TARO_ENV === 'weapp') {
    Taro.cloud.init({
      env: 'your-env-id', // 替换为你的云环境 ID
      traceUser: true,
    })
  }
}

// 调用云函数
async function callFunction<T = any>(name: string, data?: object): Promise<T> {
  try {
    const res = await Taro.cloud.callFunction({
      name,
      data,
    })
    const result = res.result as any
    
    if (result.code === 0) {
      return result.data
    } else {
      throw new Error(result.message || '请求失败')
    }
  } catch (err: any) {
    console.error(`云函数 ${name} 调用失败:`, err)
    throw err
  }
}

// ========== 用户相关 ==========

export async function login() {
  return callFunction('login')
}

export async function bindPhone(cloudID: string) {
  return callFunction('bindPhone', { cloudID })
}

// ========== 首页相关 ==========

export async function getHomeConfig() {
  return callFunction('getHomeConfig')
}

// ========== 服务相关 ==========

interface GetServicesParams {
  categoryId?: string
  keyword?: string
  isHot?: boolean
  page?: number
  pageSize?: number
}

export async function getServices(params?: GetServicesParams) {
  return callFunction('getServices', params)
}

export async function getServiceDetail(id: string) {
  // 直接从云数据库读取
  const db = Taro.cloud.database()
  const res = await db.collection('services').doc(id).get()
  return res.data
}

// ========== 医院相关 ==========

interface GetHospitalsParams {
  keyword?: string
  city?: string
  level?: string
  page?: number
  pageSize?: number
}

export async function getHospitals(params?: GetHospitalsParams) {
  return callFunction('getHospitals', params)
}

export async function getHospitalDetail(id: string) {
  const db = Taro.cloud.database()
  const res = await db.collection('hospitals').doc(id).get()
  return res.data
}

// ========== 陪诊员相关 ==========

interface GetEscortsParams {
  hospitalId?: string
  level?: string
  isOnline?: boolean
  keyword?: string
  page?: number
  pageSize?: number
}

export async function getEscorts(params?: GetEscortsParams) {
  return callFunction('getEscorts', params)
}

export async function getEscortDetail(id: string) {
  const db = Taro.cloud.database()
  const res = await db.collection('escorts').doc(id).get()
  return res.data
}

// ========== 订单相关 ==========

interface CreateOrderParams {
  serviceId: string
  hospitalId: string
  departmentId?: string
  escortId?: string
  patientId: string
  appointmentDate: string
  appointmentTime: string
  couponId?: string
  userRemark?: string
}

export async function createOrder(params: CreateOrderParams) {
  return callFunction('createOrder', params)
}

interface GetOrdersParams {
  status?: string
  page?: number
  pageSize?: number
}

export async function getOrders(params?: GetOrdersParams) {
  return callFunction('getOrders', params)
}

export async function getOrderDetail(orderId: string) {
  return callFunction('getOrders', { orderId })
}

export async function cancelOrder(orderId: string, reason?: string) {
  return callFunction('cancelOrder', { orderId, reason })
}

// ========== 支付相关 ==========

export async function prepay(orderId: string) {
  return callFunction('wxpay', { orderId, action: 'prepay' })
}

// ========== 就诊人相关 ==========

export async function getPatients() {
  return callFunction('getPatients')
}

interface SavePatientParams {
  id?: string
  name: string
  phone: string
  idCard: string
  gender?: string
  birthday?: string
  relation: string
  medicalCardNo?: string
  isDefault?: boolean
}

export async function savePatient(params: SavePatientParams) {
  return callFunction('savePatient', params)
}

export async function deletePatient(id: string) {
  return callFunction('deletePatient', { id })
}

