import { defineConfig } from '@prisma/client'

export default defineConfig({
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
  generator: {
    provider: 'prisma-client-js',
  },
})
