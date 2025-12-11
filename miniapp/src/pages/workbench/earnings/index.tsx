import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, useReachBottom } from '@tarojs/taro'
import { useState, useEffect } from 'react'
import Icon from '@/components/Icon'
import { get } from '@/services/request'
import './index.scss'

interface WalletInfo {
  balance: number
  frozenBalance: number
  totalEarned: number
  totalWithdrawn: number
  monthEarnings: number
  pendingWithdrawal: number
}

interface Transaction {
  id: string
  type: 'commission' | 'withdraw' | 'withdraw_fee' | 'refund_deduct' | 'debt_deduct'
  amount: number
  balanceAfter: number
  title: string
  remark: string | null
  createdAt: string
}

type TabType = 'all' | 'income' | 'expense'

export default function Earnings() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)

  // 加载钱包信息
  const loadWallet = async () => {
    try {
      const data = await get('/escort/wallet')
      setWallet(data)
    } catch (err) {
      console.error('加载钱包失败:', err)
    }
  }

  // 加载交易记录
  const loadTransactions = async (pageNum: number, type: TabType, reset = false) => {
    try {
      const params: Record<string, any> = { page: pageNum, pageSize: 20 }
      if (type !== 'all') {
        params.type = type
      }
      const result = await get('/escort/wallet/transactions', params)
      const newData = result?.data || []

      if (reset) {
        setTransactions(newData)
      } else {
        setTransactions(prev => [...prev, ...newData])
      }

      setHasMore(newData.length >= 20)
    } catch (err) {
      console.error('加载交易记录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 切换 Tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setPage(1)
    setLoading(true)
    loadTransactions(1, tab, true)
  }

  // 跳转提现
  const goWithdraw = () => {
    Taro.navigateTo({ url: '/pages/workbench/withdraw/index' })
  }

  useEffect(() => {
    loadWallet()
    loadTransactions(1, activeTab, true)
  }, [])

  useDidShow(() => {
    loadWallet()
  })

  useReachBottom(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      loadTransactions(nextPage, activeTab)
    }
  })

  // 判断是否是收入类型
  const isIncome = (type: string) => type === 'commission'

  // 格式化金额
  const formatAmount = (amount: number, type: string) => {
    const prefix = isIncome(type) ? '+' : '-'
    return `${prefix}${Math.abs(amount).toFixed(2)}`
  }

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 获取交易图标
  const getTransIcon = (type: string) => {
    switch (type) {
      case 'commission':
        return 'trending-up'
      case 'withdraw':
        return 'credit-card'
      case 'withdraw_fee':
        return 'minus-circle'
      case 'refund_deduct':
      case 'debt_deduct':
        return 'alert-circle'
      default:
        return 'circle'
    }
  }

  return (
    <View className='earnings-page'>
      {/* 钱包卡片 */}
      <View className='wallet-card'>
        <View className='balance-section'>
          <Text className='balance-label'>可提现余额 (元)</Text>
          <Text className='balance-value'>
            <Text className='currency'>¥</Text>
            {wallet?.balance.toFixed(2) || '0.00'}
          </Text>
        </View>

        <View className='wallet-stats'>
          <View className='stat-item'>
            <Text className='stat-value'>¥{wallet?.frozenBalance.toFixed(2) || '0.00'}</Text>
            <Text className='stat-label'>冻结中</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>¥{wallet?.monthEarnings.toFixed(2) || '0.00'}</Text>
            <Text className='stat-label'>本月收入</Text>
          </View>
          <View className='stat-item'>
            <Text className='stat-value'>¥{wallet?.totalEarned.toFixed(2) || '0.00'}</Text>
            <Text className='stat-label'>累计收入</Text>
          </View>
        </View>

        <View className='withdraw-btn' onClick={goWithdraw}>
          提现
        </View>
      </View>

      {/* Tab 栏 */}
      <View className='tab-bar'>
        <View
          className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          全部
        </View>
        <View
          className={`tab-item ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => handleTabChange('income')}
        >
          收入
        </View>
        <View
          className={`tab-item ${activeTab === 'expense' ? 'active' : ''}`}
          onClick={() => handleTabChange('expense')}
        >
          支出
        </View>
      </View>

      {/* 交易列表 */}
      {loading && transactions.length === 0 ? (
        <View className='empty-container'>
          <Text className='empty-text'>加载中...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View className='empty-container'>
          <Icon name='inbox' size={64} color='#d9d9d9' />
          <Text className='empty-text'>暂无记录</Text>
        </View>
      ) : (
        <View className='transaction-list'>
          {transactions.map(item => (
            <View key={item.id} className='transaction-item'>
              <View className={`trans-icon ${isIncome(item.type) ? 'income' : 'expense'}`}>
                <Icon
                  name={getTransIcon(item.type)}
                  size={32}
                  color={isIncome(item.type) ? '#52c41a' : '#ff6b35'}
                />
              </View>
              <View className='trans-info'>
                <Text className='trans-title'>{item.title}</Text>
                <Text className='trans-time'>{formatTime(item.createdAt)}</Text>
              </View>
              <Text className={`trans-amount ${isIncome(item.type) ? 'income' : 'expense'}`}>
                {formatAmount(item.amount, item.type)}
              </Text>
            </View>
          ))}

          {hasMore && (
            <View className='loading-more'>加载更多...</View>
          )}
        </View>
      )}
    </View>
  )
}
