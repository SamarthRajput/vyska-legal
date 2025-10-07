For developers : use pnpm
First install all the dependencies using ` pnpm i ` command
// ` pnpm dlx prisma generate `      # Generate Prisma Client after schema changes
// ` pnpm dlx prisma db push `       # Push schema changes to DB (dev, non-destructive)
// ` pnpm dlx prisma migrate dev `   # Create & apply migration for schema changes
// ` pnpm dlx prisma migrate reset `  # Reset DB: drop, recreate, reapply migrations (dev only)
// ` pnpm dlx prisma studio `        # Open Prisma GUI to view/manage DB
// ` pnpm dlx prisma format `        # Format schema.prisma
// ` pnpm dlx prisma db pull `       # Pull existing DB schema into prisma file
// ` pnpm run prisma:seed `           # Run the seed.ts file