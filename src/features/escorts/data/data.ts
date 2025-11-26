import { Award, UserCheck, Users, GraduationCap } from 'lucide-react'
import { type EscortStatus } from './schema'

export const callTypes = new Map<EscortStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['pending', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const categories = [
  {
    label: '高级陪诊员',
    value: 'senior',
    icon: Award,
  },
  {
    label: '中级陪诊员',
    value: 'intermediate',
    icon: UserCheck,
  },
  {
    label: '初级陪诊员',
    value: 'junior',
    icon: Users,
  },
  {
    label: '实习陪诊员',
    value: 'trainee',
    icon: GraduationCap,
  },
] as const
