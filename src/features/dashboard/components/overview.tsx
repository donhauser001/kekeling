import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { useOrderTrend } from '@/hooks/use-api'
import { Skeleton } from '@/components/ui/skeleton'

export function Overview() {
  const { data: trendData, isLoading } = useOrderTrend(14)

  // 转换数据格式
  const chartData = (trendData ?? []).map(item => ({
    name: new Date(item.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
    total: item.count,
  }))

  if (isLoading) {
    return <Skeleton className='h-[350px] w-full' />
  }

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          direction='ltr'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}单`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
