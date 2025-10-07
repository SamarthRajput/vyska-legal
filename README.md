# 🧑‍💻 Developer Setup

## 📦 Install Dependencies
```bash
pnpm i
```

## 🧰 Prisma Commands

| Command | Description |
|----------|--------------|
| `pnpm dev` | To run the project locally |
| `pnpm dlx prisma generate` | Generate Prisma Client after schema changes |
| `pnpm dlx prisma db push` | Push schema changes to the database (development, non-destructive) |
| `pnpm dlx prisma migrate dev` | Create and apply a new migration for schema changes |
| `pnpm dlx prisma migrate reset` | Reset the database (drop, recreate, reapply migrations) — ⚠️ dev only |
| `pnpm dlx prisma studio` | Open Prisma Studio (GUI for managing the database) |
| `pnpm dlx prisma format` | Format the `schema.prisma` file |
| `pnpm dlx prisma db pull` | Pull the existing database schema into Prisma |
| `pnpm run prisma:seed` | Run the `seed.ts` script to populate the database |
