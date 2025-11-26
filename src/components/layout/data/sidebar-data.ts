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
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  FolderOpen,
  CircleUser,
  Briefcase,
  Building2,
  Network,
  Tags,
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
      title: '常用功能',
      items: [
        {
          title: '控制台',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '文件中心',
          url: '/files',
          icon: FolderOpen,
        },
        {
          title: '消息中心',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
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
              icon: Tags,
            },
          ],
        },
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
    {
      title: '页面',
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
      ],
    },
    {
      title: '其他',
      items: [
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
