import { PrismaClient } from '@prisma/client';

// Declare a global variable to potentially hold the PrismaClient instance.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Use a function to get or create the Prisma client instance.
// This helps manage the singleton pattern, especially in serverless environments or with hot-reloading.
const getPrismaClient = (): PrismaClient => {
  if (process.env.NODE_ENV === 'production') {
    // In production, always create a new instance or use a connection pool strategy
    if (!prisma) {
      prisma = new PrismaClient();
    }
    return prisma;
  } else {
    // In development, reuse the global instance if it exists to avoid too many connections.
    if (!global.prisma) {
      global.prisma = new PrismaClient();
       console.log("Initialized new PrismaClient instance in development.");
    } else {
         // console.log("Reusing existing PrismaClient instance in development.");
    }
    return global.prisma;
  }
};

// Export the function to get the client instance.
// All parts of your application should import and call this function.
export default getPrismaClient(); // Export the instance directly for convenience, managed by the function

// Note: The direct export `getPrismaClient()` might still cause issues with server actions.
// It might be safer to export the function `getPrismaClient` itself and call it where needed:
// e.g., in your lib files:
// import getPrismaClient from './prisma';
// const prisma = getPrismaClient();
// await prisma.user.findMany(...);
// However, for simplicity in this project structure, we'll keep the direct export for now.
