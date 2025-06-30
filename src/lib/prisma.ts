import { PrismaClient } from '@prisma/client'

declare global {
  // In Node.js, `global` puede guardar el cliente para evitar múltiples instancias
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma ?? new PrismaClient({
  log: ['error', 'warn'], // Opcional para ver errores
})

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
