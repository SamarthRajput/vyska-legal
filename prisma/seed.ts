/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

// pnpm dlx prisma migrate dev --name init
// pnpm run prisma:seed

async function main() {
    // Create Users
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'rohit@gmail.com',
            clerkId: 'clerk-admin-id',
            role: 'ADMIN',
            profilePicture: 'https://i.pravatar.cc/150?img=1',
        },
    })
    console.log('Admin user created:', admin.email)

    const user1 = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'USER',
            clerkId: 'clerk-user1-id',
            profilePicture: 'https://i.pravatar.cc/150?img=2',
        },
    })
    console.log('Regular user created:', user1.email)

    // Create Blogs
    await prisma.blog.createMany({
        data: [
            {
                title: 'Understanding Legal Contracts',
                content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                status: 'APPROVED',
                authorId: admin.id,
            },
            {
                title: 'Tips for Drafting Legal Documents',
                content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                status: 'PENDING',
                authorId: user1.id,
            },
        ],
    })

    // Create Services
    await prisma.service.createMany({
        data: [
            {
                title: 'Contract Review',
                description: 'We review your contracts for clarity and legal compliance.',
                price: 150.0,
                iconUrl: 'https://img.icons8.com/ios-filled/50/000000/document.png',
            },
            {
                title: 'Legal Consultation',
                description: 'One-on-one consultation with our legal experts.',
                price: 100.0,
                iconUrl: 'https://img.icons8.com/ios-filled/50/000000/law.png',
            },
        ],
    })

    // Create Research
    await prisma.research.createMany({
        data: [
            {
                title: 'Corporate Law Whitepaper',
                description: 'An in-depth analysis of corporate regulations.',
                fileUrl: 'https://example.com/corporate-law.pdf',
                uploadedById: admin.id,
            },
            {
                title: 'Intellectual Property Research',
                description: 'Study on recent trends in IP law.',
                fileUrl: 'https://example.com/ip-research.pdf',
                uploadedById: user1.id,
            },
        ],
    })

    // Create Appointments
    await prisma.appointment.createMany({
        data: [
            {
                userId: user1.id,
                date: new Date('2025-10-15T09:00:00Z'),
                timeSlot: '09:00-09:30',
                status: 'CONFIRMED',
            },
            {
                userId: user1.id,
                date: new Date('2025-10-16T11:00:00Z'),
                timeSlot: '11:00-11:30',
                status: 'PENDING',
            },
        ],
    })

    console.log('✅ Seed data created successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
