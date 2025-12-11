import { View, Text, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { get, post } from '@/services/request'
import './index.scss'

interface WalletInfo {
  balance: number
  frozenBalance: number
  withdrawMethod: string | null
  withdrawAccount: string | null
}

interface WithdrawConfig {
  minWithdrawAmount: number
  withdrawFeeRate: number
  withdrawFeeFixed: number
}

type PayMethod = 'alipay' | 'wechat'

export default function Withdraw() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [config, setConfig] = useState<WithdrawConfig>({
    minWithdrawAmount: 100,
    withdrawFeeRate: 0,
    withdrawFeeFixed: 0,
  })
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PayMethod>('alipay')
  const [account, setAccount] = useState('')
  const [realName, setRealName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 加载钱包信息
  const loadWallet = async () => {
    try {
      const data = await get('/escort/wallet')
      setWallet(data)
      if (data.withdrawMethod) {
        setMethod(data.withdrawMethod as PayMethod)
      }
      if (data.withdrawAccount) {
        setAccount(data.withdrawAccount)
      }
    } catch (err) {
      console.error('加载钱包失败:', err)
    }
  }

  useEffect(() => {
    loadWallet()
  }, [])

  useDidShow(() => {
    loadWallet()
  })

  // 计算手续费
  const fee = Number(amount) > 0
    ? Number(amount) * config.withdrawFeeRate + config.withdrawFeeFixed
    : 0

  // 实际到账
  const actualAmount = Number(amount) - fee

  // 全部提现
  const handleWithdrawAll = () => {
    if (wallet?.balance) {
      setAmount(wallet.balance.toString())
    }
  }

  // 检查是否可以提交
  const canSubmit = () => {
    if (!amount || Number(amount) <= 0) return false
    if (Number(amount) < config.minWithdrawAmount) return false
    if (Number(amount) > (wallet?.balance || 0)) return false
    if (!account.trim()) return false
    return true
  }

  // 提交提现
  const handleSubmit = async () => {
    if (!canSubmit() || submitting) return

    if (Number(amount) < config.minWithdrawAmount) {
      Taro.showToast({
        title: `最低提现金额 ${config.minWithdrawAmount} 元`,
        icon: 'none'
      })
      return
    }

    if (Number(amount) > (wallet?.balance || 0)) {
      Taro.showToast({ title: '余额不足', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      await post('/escort/wallet/withdraw', {
        amount: Number(amount),
        method,
        account: account.trim(),
        realName: realName.trim() || undefined,
      })

      Taro.showToast({ title: '提现申请已提交', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (err: any) {
      Taro.showToast({ title: err.message || '提现失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  // 查看提现记录
  const viewHistory = async () => {
    // 可以跳转到提现记录页，这里简单展示
    try {
      const result = await get('/escort/wallet/withdrawals', { pageSize: 10 })
      const data = result?.data || []

      if (data.length === 0) {
        Taro.showToast({ title: '暂无提现记录', icon: 'none' })
        return
      }

      // 简单展示最近一条
      const latest = data[0]
      const statusMap: Record<string, string> = {
        pending: '待审核',
        approved: '已通过',
        processing: '打款中',
        completed: '已完成',
        rejected: '已拒绝',
        failed: '打款失败',
      }

      Taro.showModal({
        title: '最近提现',
        content: `金额: ¥${latest.amount}\n状态: ${statusMap[latest.status] || latest.status}\n时间: ${new Date(latest.createdAt).toLocaleString()}`,
        showCancel: false,
      })
    } catch (err) {
      console.error('获取提现记录失败:', err)
    }
  }

  return (
    <View className='withdraw-page'>
      {/* 余额显示 */}
      <View className='balance-card'>
        <Text className='balance-label'>可提现余额</Text>
        <Text className='balance-value'>
          <Text className='currency'>¥</Text>
          {wallet?.balance.toFixed(2) || '0.00'}
        </Text>
      </View>

      {/* 提现金额 */}
      <View className='amount-section'>
        <Text className='section-title'>提现金额</Text>
        <View className='amount-input-wrap'>
          <Text className='currency-sign'>¥</Text>
          <Input
            className='amount-input'
            type='digit'
            placeholder='0.00'
            value={amount}
            onInput={e => setAmount(e.detail.value)}
          />
          <View className='all-btn' onClick={handleWithdrawAll}>
            全部提现
          </View>
        </View>
        <View className='amount-tips'>
          最低提现金额 <Text className='highlight'>¥{config.minWithdrawAmount}</Text>
          {config.withdrawFeeRate > 0 && (
            <>，手续费 <Text className='highlight'>{(config.withdrawFeeRate * 100).toFixed(1)}%</Text></>
          )}
        </View>
      </View>

      {/* 提现方式 */}
      <View className='method-section'>
        <Text className='section-title'>提现方式</Text>
        <View className='method-list'>
          <View className='method-item' onClick={() => setMethod('alipay')}>
            <View className='method-icon alipay'>
              <Icon name='credit-card' size={32} color='#1677ff' />
            </View>
            <View className='method-info'>
              <Text className='method-name'>支付宝</Text>
              <Text className='method-account'>实时到账</Text>
            </View>
            <View className={`method-check ${method === 'alipay' ? 'checked' : ''}`}>
              {method === 'alipay' && (
                <Icon name='check' size={24} color='#fff' />
              )}
            </View>
          </View>
          <View className='method-item' onClick={() => setMethod('wechat')}>
            <View className='method-icon wechat'>
              <Icon name='message-circle' size={32} color='#07c160' />
            </View>
            <View className='method-info'>
              <Text className='method-name'>微信</Text>
              <Text className='method-account'>实时到账</Text>
            </View>
            <View className={`method-check ${method === 'wechat' ? 'checked' : ''}`}>
              {method === 'wechat' && (
                <Icon name='check' size={24} color='#fff' />
              )}
            </View>
          </View>
        </View>
      </View>

      {/* 收款账号 */}
      <View className='account-section'>
        <Text className='section-title'>收款账号</Text>
        <View className='form-item'>
          <Text className='form-label'>
            {method === 'alipay' ? '支付宝账号' : '微信号'}
          </Text>
          <Input
            className='form-input'
            placeholder={method === 'alipay' ? '请输入支付宝账号' : '请输入微信号'}
            value={account}
            onInput={e => setAccount(e.detail.value)}
          />
        </View>
        <View className='form-item'>
          <Text className='form-label'>真实姓名</Text>
          <Input
            className='form-input'
            placeholder='请输入收款人真实姓名'
            value={realName}
            onInput={e => setRealName(e.detail.value)}
          />
        </View>
      </View>

      {/* 提现记录入口 */}
      <View className='history-entry' onClick={viewHistory}>
        <View className='entry-content'>
          <Text className='entry-text'>提现记录</Text>
          <Icon name='chevron-right' size={20} color='#999' />
        </View>
      </View>

      {/* 底部提交栏 */}
      <View className='submit-bar'>
        <View className='fee-info'>
          <Text>手续费: ¥{fee.toFixed(2)}</Text>
          <Text>
            实际到账: <Text className='actual-amount'>¥{actualAmount > 0 ? actualAmount.toFixed(2) : '0.00'}</Text>
          </Text>
        </View>
        <View
          className={`submit-btn ${!canSubmit() ? 'disabled' : ''}`}
          onClick={handleSubmit}
        >
          {submitting ? '提交中...' : '确认提现'}
        </View>
      </View>
    </View>
  )
}
