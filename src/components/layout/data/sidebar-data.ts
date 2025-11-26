import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  ShieldCheck,
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
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: '管理员',
    email: 'admin@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '企业管理系统',
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
          title: '数据统计',
          url: '/data/statistics',
          icon: BarChart3,
        },
        {
          title: '数据报表',
          url: '/data/reports',
          icon: FileSpreadsheet,
        },
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
      title: '系统',
      items: [
        {
          title: '文件中心',
          url: '/files',
          icon: FolderOpen,
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
    {
      title: '演示页面',
      items: [
        {
          title: '认证',
          icon: ShieldCheck,
          items: [
            {
              title: '登录',
              url: '/sign-in',
            },
            {
              title: '登录 (双栏)',
              url: '/sign-in-2',
            },
            {
              title: '注册',
              url: '/sign-up',
            },
            {
              title: '忘记密码',
              url: '/forgot-password',
            },
            {
              title: '验证码',
              url: '/otp',
            },
          ],
        },
        {
          title: '错误页',
          icon: Bug,
          items: [
            {
              title: '未授权',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: '禁止访问',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: '页面不存在',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: '服务器错误',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: '系统维护',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
        {
          title: 'Clerk 认证',
          icon: ClerkLogo,
          items: [
            {
              title: '登录',
              url: '/clerk/sign-in',
            },
            {
              title: '注册',
              url: '/clerk/sign-up',
            },
            {
              title: '用户管理',
              url: '/clerk/user-management',
            },
          ],
        },
      ],
    },
  ],
}
