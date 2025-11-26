import { Briefcase, UserCheck, Users, Building2 } from 'lucide-react'
import { type EmployeeStatus } from './schema'

export const callTypes = new Map<EmployeeStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300'],
  ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const roles = [
  {
    label: '总经理',
    value: 'director',
    icon: Building2,
  },
  {
    label: '部门主管',
    value: 'manager',
    icon: UserCheck,
  },
  {
    label: '项目经理',
    value: 'pm',
    icon: Briefcase,
  },
  {
    label: '普通员工',
    value: 'staff',
    icon: Users,
  },
] as const
