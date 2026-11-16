import { PrismaClient } from '@prisma/client'

if (!process.env.POSTGRES_PRISMA_URL) {
    const pooledUrl =
        process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? null

    if (pooledUrl) {
        process.env.POSTGRES_PRISMA_URL = pooledUrl
    }
}

if (!process.env.POSTGRES_URL_NON_POOLING) {
    const directUrl =
        process.env.POSTGRES_URL_NON_POOLING ??
        process.env.POSTGRES_URL ??
        process.env.DATABASE_URL ??
        null

    if (directUrl) {
        process.env.POSTGRES_URL_NON_POOLING = directUrl
    }
}

const prismaClientSingleton = () => {
    return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma