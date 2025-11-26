import { z } from 'zod'

const employeeStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>

const employeeRoleSchema = z.union([
  z.literal('director'),
  z.literal('manager'),
  z.literal('pm'),
  z.literal('staff'),
])

const employeeSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  status: employeeStatusSchema,
  role: employeeRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type Employee = z.infer<typeof employeeSchema>

export const employeeListSchema = z.array(employeeSchema)
