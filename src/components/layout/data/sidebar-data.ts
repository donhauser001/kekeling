import {
  LayoutDashboard,
  Monitor,
  HelpCircle,
  Bell,
  Palette,
  Settings,
  Wrench,
  UserCog,
  Users,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FolderOpen,
  CircleUser,
  Briefcase,
  Building2,
  Network,
  Tag,
  Layers,
  Stethoscope,
  UserCheck,
  HeartPulse,
  UserRound,
  LayoutList,
  Hospital,
  Tags,
  Award,
  Store,
  PackageSearch,
  FolderTree,
  GitBranch,
  BadgePercent,
  ClipboardCheck,
  ClipboardList,
  Building,
  GitFork,
  Globe,
  FileText,
  Newspaper,
  FolderKanban,
  BookmarkIcon,
  Menu,
  Cog,
  Smartphone,
  Megaphone,
  Image,
  MonitorSmartphone,
  MessageSquareText,
  Send,
  Search,
  ToggleLeft,
  Database,
  BarChart3,
  FileSpreadsheet,
  Upload,
  Download,
  DatabaseBackup,
  BookOpen,
  ScrollText,
  LogIn,
  Activity,
  Brain,
  Library,
  SlidersHorizontal,
  Wallet,
  Receipt,
  CreditCard,
  FileCheck,
  Banknote,
  Gift,
  Ticket,
  Sparkles,
  UserPlus,
  Headphones,
  TicketCheck,
  MessageCircle,
  AlertCircle,
  Star,
  Shield,
  UserCog2,
  KeyRound,
  LayoutGrid,
  Mail,
  MessagesSquare,
  Clock,
  CalendarRange,
  TrendingUp,
  Bot,
  History,
  Lightbulb,
  HardDrive,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '管理员',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '科科灵中控系统',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: '科技公司',
      logo: GalleryVerticalEnd,
      plan: '企业版',
    },
    {
      name: '创业公司',
      logo: AudioWaveform,
      plan: '创业版',
    },
  ],
  navGroups: [
    {
      title: '工作台',
      items: [
        {
          title: '控制台',
          url: '/',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: '业务运营',
      items: [
        {
          title: '订单管理',
          url: '/orders',
          icon: ClipboardList,
        },
        {
          title: '业务中心',
          icon: Store,
          items: [
            {
              title: '服务管理',
              url: '/services',
              icon: PackageSearch,
            },
            {
              title: '服务分类',
              url: '/service-categories',
              icon: FolderTree,
            },
            {
              title: '流程管理',
              url: '/workflows',
              icon: GitBranch,
            },
            {
              title: '服务保障',
              url: '/service-guarantees',
              icon: Shield,
            },
            {
              title: '操作规范',
              url: '/operation-guides',
              icon: BookOpen,
            },
            {
              title: '价格政策',
              url: '/pricing-policies',
              icon: BadgePercent,
            },
            {
              title: '接单设置',
              url: '/order-settings',
              icon: ClipboardCheck,
            },
          ],
        },
        {
          title: '医疗资源',
          icon: HeartPulse,
          items: [
            {
              title: '医师库',
              url: '/doctors',
              icon: UserRound,
            },
            {
              title: '科室库',
              url: '/departments',
              icon: LayoutList,
            },
            {
              title: '医院库',
              url: '/hospitals',
              icon: Hospital,
            },
            {
              title: '标签云',
              url: '/medical-tags',
              icon: Tags,
            },
            {
              title: '级别管理',
              url: '/medical-levels',
              icon: Award,
            },
          ],
        },
        {
          title: '陪诊员',
          icon: Stethoscope,
          items: [
            {
              title: '人员管理',
              url: '/escorts',
              icon: UserCheck,
            },
            {
              title: '人员分类',
              url: '/escort-categories',
              icon: Layers,
            },
            {
              title: '人员标签',
              url: '/escort-tags',
              icon: Tag,
            },
          ],
        },
        {
          title: '用户中心',
          icon: CircleUser,
          items: [
            {
              title: '用户管理',
              url: '/users',
              icon: Users,
            },
            {
              title: '用户分类',
              url: '/roles',
              icon: Layers,
            },
            {
              title: '用户标签',
              url: '/tags',
              icon: Tag,
            },
          ],
        },
        {
          title: '财务中心',
          icon: Wallet,
          items: [
            {
              title: '账单管理',
              url: '/finance/bills',
              icon: Receipt,
            },
            {
              title: '收支明细',
              url: '/finance/transactions',
              icon: CreditCard,
            },
            {
              title: '结算管理',
              url: '/finance/settlements',
              icon: FileCheck,
            },
            {
              title: '发票管理',
              url: '/finance/invoices',
              icon: FileText,
            },
            {
              title: '提现管理',
              url: '/finance/withdrawals',
              icon: Banknote,
            },
          ],
        },
        {
          title: '营销中心',
          icon: Gift,
          items: [
            {
              title: '优惠券管理',
              url: '/marketing/coupons',
              icon: Ticket,
            },
            {
              title: '活动管理',
              url: '/marketing/campaigns',
              icon: Sparkles,
            },
            {
              title: '积分管理',
              url: '/marketing/points',
              icon: Award,
            },
            {
              title: '邀请奖励',
              url: '/marketing/referrals',
              icon: UserPlus,
            },
          ],
        },
        {
          title: '客服中心',
          icon: Headphones,
          items: [
            {
              title: '工单管理',
              url: '/support/tickets',
              icon: TicketCheck,
            },
            {
              title: '在线客服',
              url: '/support/chat',
              icon: MessageCircle,
            },
            {
              title: '投诉建议',
              url: '/support/complaints',
              icon: AlertCircle,
            },
            {
              title: '评价管理',
              url: '/support/reviews',
              icon: Star,
            },
          ],
        },
        {
          title: '产品中心',
          icon: Smartphone,
          items: [
            {
              title: '广告管理',
              url: '/app/ads',
              icon: Megaphone,
            },
            {
              title: '轮播图管理',
              url: '/app/banners',
              icon: Image,
            },
            {
              title: '启动页管理',
              url: '/app/splash',
              icon: MonitorSmartphone,
            },
            {
              title: '弹窗管理',
              url: '/app/popups',
              icon: MessageSquareText,
            },
            {
              title: '消息推送',
              url: '/app/push',
              icon: Send,
            },
            {
              title: '版本管理',
              url: '/app/versions',
              icon: Tag,
            },
            {
              title: '热门搜索',
              url: '/app/hot-search',
              icon: Search,
            },
            {
              title: '开关配置',
              url: '/app/switches',
              icon: ToggleLeft,
            },
            {
              title: '品牌设置',
              url: '/app/settings/brand',
              icon: Sparkles,
            },
            {
              title: '首页管理',
              url: '/app/settings/homepage',
              icon: LayoutGrid,
            },
          ],
        },
      ],
    },
    {
      title: '组织管理',
      items: [
        {
          title: '人力资源',
          icon: Building2,
          items: [
            {
              title: '员工管理',
              url: '/employees',
              icon: Briefcase,
            },
            {
              title: '岗位设置',
              url: '/positions',
              icon: Network,
            },
            {
              title: '考勤管理',
              url: '/hr/attendance',
              icon: Clock,
            },
            {
              title: '排班管理',
              url: '/hr/scheduling',
              icon: CalendarRange,
            },
            {
              title: '绩效管理',
              url: '/hr/performance',
              icon: TrendingUp,
            },
          ],
        },
        {
          title: '企业管理',
          icon: Building,
          items: [
            {
              title: '企业设置',
              url: '/enterprise/settings',
              icon: Cog,
            },
            {
              title: '部门设置',
              url: '/enterprise/departments',
              icon: FolderKanban,
            },
            {
              title: '组织架构',
              url: '/enterprise/structure',
              icon: GitFork,
            },
          ],
        },
      ],
    },
    {
      title: '数据管理',
      items: [
        {
          title: '数据中心',
          icon: Database,
          items: [
            {
              title: '数据统计',
              url: '/data/statistics',
              icon: BarChart3,
            },
            {
              title: '数据报表',
              url: '/data/reports',
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          title: 'AI中心',
          icon: Brain,
          items: [
            {
              title: '知识库',
              url: '/ai/knowledge-base',
              icon: Library,
            },
            {
              title: 'AI客服',
              url: '/ai/chatbot',
              icon: Bot,
            },
            {
              title: '对话记录',
              url: '/ai/conversations',
              icon: History,
            },
            {
              title: '智能推荐',
              url: '/ai/recommendations',
              icon: Lightbulb,
            },
            {
              title: 'AI配置',
              url: '/ai/settings',
              icon: SlidersHorizontal,
            },
          ],
        },
      ],
    },
    {
      title: '系统',
      items: [
        {
          title: '文件中心',
          url: '/files',
          icon: FolderOpen,
        },
        {
          title: '权限管理',
          icon: Shield,
          items: [
            {
              title: '管理员管理',
              url: '/system/admins',
              icon: UserCog2,
            },
            {
              title: '角色管理',
              url: '/system/roles',
              icon: Users,
            },
            {
              title: '权限配置',
              url: '/system/permissions',
              icon: KeyRound,
            },
            {
              title: '菜单管理',
              url: '/system/menus',
              icon: LayoutGrid,
            },
          ],
        },
        {
          title: '消息中心',
          icon: MessagesSquare,
          items: [
            {
              title: '系统通知',
              url: '/message/notifications',
              icon: Bell,
            },
            {
              title: '消息模板',
              url: '/message/templates',
              icon: FileText,
            },
            {
              title: '短信配置',
              url: '/message/sms',
              icon: MessageSquareText,
            },
            {
              title: '邮件配置',
              url: '/message/email',
              icon: Mail,
            },
          ],
        },
        {
          title: '数据维护',
          icon: HardDrive,
          items: [
            {
              title: '数据导入',
              url: '/data/import',
              icon: Upload,
            },
            {
              title: '数据导出',
              url: '/data/export',
              icon: Download,
            },
            {
              title: '数据备份',
              url: '/data/backup',
              icon: DatabaseBackup,
            },
            {
              title: '数据字典',
              url: '/data/dictionary',
              icon: BookOpen,
            },
            {
              title: '操作日志',
              url: '/data/operation-logs',
              icon: ScrollText,
            },
            {
              title: '登录日志',
              url: '/data/login-logs',
              icon: LogIn,
            },
            {
              title: '系统日志',
              url: '/data/system-logs',
              icon: Activity,
            },
          ],
        },
        {
          title: '官网运营',
          icon: Globe,
          items: [
            {
              title: '页面',
              url: '/cms/pages',
              icon: FileText,
            },
            {
              title: '文章',
              url: '/cms/articles',
              icon: Newspaper,
            },
            {
              title: '文章分类',
              url: '/cms/article-categories',
              icon: FolderTree,
            },
            {
              title: '文章标签',
              url: '/cms/article-tags',
              icon: BookmarkIcon,
            },
            {
              title: '菜单',
              url: '/cms/menus',
              icon: Menu,
            },
            {
              title: '网站设置',
              url: '/cms/settings',
              icon: Cog,
            },
          ],
        },
        {
          title: '设置',
          icon: Settings,
          items: [
            {
              title: '个人资料',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: '账户设置',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: '外观',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: '通知',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: '显示',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}
