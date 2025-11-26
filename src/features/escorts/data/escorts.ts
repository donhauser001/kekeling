import { faker } from '@faker-js/faker'

// Set a fixed seed for consistent data generation
faker.seed(12345)

export const escorts = Array.from({ length: 500 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: faker.string.uuid(),
    firstName,
    lastName,
    username: faker.internet
      .username({ firstName, lastName })
      .toLocaleLowerCase(),
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    phoneNumber: faker.phone.number({ style: 'international' }),
    status: faker.helpers.arrayElement([
      'active',
      'inactive',
      'pending',
      'suspended',
    ]),
    category: faker.helpers.arrayElement([
      'senior',
      'intermediate',
      'junior',
      'trainee',
    ]),
    consultCount: faker.number.int({ min: 50, max: 2000 }),
    satisfaction: faker.number.float({ min: 85, max: 100, fractionDigits: 1 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }
})
