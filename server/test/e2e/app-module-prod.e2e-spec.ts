import 'reflect-metadata'

describe('AppModule (production wiring)', () => {
  it('does not include TestModule when NODE_ENV=production', async () => {
    const oldEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    jest.resetModules()
    const { AppModule } = await import('../../src/app.module')

    const imports = Reflect.getMetadata('imports', AppModule) as unknown[] | undefined
    const importNames = (imports || []).map((m) => (m as { name?: string })?.name).filter(Boolean)

    expect(importNames).not.toContain('TestModule')

    process.env.NODE_ENV = oldEnv
  })
})

