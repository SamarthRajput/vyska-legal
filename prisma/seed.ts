/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

// pnpm dlx prisma migrate dev --name init
// pnpm run prisma:seed

async function main() {
    // Create Users
    let admin = await prisma.user.findUnique({ where: { email: 'rohit@gmail.com' } });
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'rohit@gmail.com',
                clerkId: 'clerk-admin-id',
                role: 'ADMIN',
                profilePicture: 'https://i.pravatar.cc/150?img=1',
            },
        });
        console.log('Admin user created:', admin.email);
    } else {
        console.log('Admin user already exists:', admin.email);
    }

    let user1 = await prisma.user.findUnique({ where: { email: 'john@example.com' } });
    if (!user1) {
        user1 = await prisma.user.create({
            data: {
                name: 'John Doe',
                email: 'john@example.com',
                role: 'USER',
                clerkId: 'clerk-user1-id',
                profilePicture: 'https://i.pravatar.cc/150?img=2',
            },
        });
        console.log('Regular user created:', user1.email);
    } else {
        console.log('Regular user already exists:', user1.email);
    }

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
    // Create Team Members
    await prisma.teamMember.createMany({
        data: [
            {
                name: 'Adv. Rohan Mehta',
                role: 'Senior Corporate Lawyer',
                biography:
                    'Rohan Mehta has over 12 years of experience specializing in corporate law, mergers, and acquisitions. He has represented numerous Fortune 500 companies in regulatory matters.',
                photoUrl: 'https://imgs.search.brave.com/2920ZlfBVr3zNhET70QktLKyjB1Y000bhlKxDoqqKjU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/cGl4YWJheS5jb20v/cGhvdG8vMjAxNy8w/Ny8xOC8yMy8yMy9n/cm91cC0yNTE3NDI4/XzY0MC5wbmc',
                createdById: admin.id,
            },
            {
                name: 'Adv. Priya Sharma',
                role: 'Intellectual Property Expert',
                biography:
                    'Priya Sharma focuses on intellectual property rights, patents, and trademarks. She has been instrumental in shaping IP policies for several startups.',
                photoUrl: 'https://imgs.search.brave.com/wE1-b8ltCYbfQ4xSFlHHIAPUCzF3wAKKtPZ-7Od_kEc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/cHJlbWl1bS1wc2Qv/dXNlci1pY2VtYXR0/ZV8xNjE2NjktMjEx/LmpwZz9zZW10PWFp/c19oeWJyaWQmdz03/NDAmcT04MA',
                createdById: admin.id,
            },
            {
                name: 'Adv. Arjun Khanna',
                role: 'Criminal Law Specialist',
                biography:
                    'With a decade of courtroom experience, Arjun Khanna is known for his strategic litigation skills and deep understanding of criminal jurisprudence.',
                photoUrl: 'https://example.com/arjun-khanna.jpg',
                createdById: admin.id,
            },
        ],
    });

    console.log('Team members created');
    const slot1 = await prisma.appointmentSlot.create({
        data: {
            date: new Date('2025-10-15T09:00:00Z'),
            timeSlot: '09:00-09:30',
            isBooked: false,
        },
    });

    const slot2 = await prisma.appointmentSlot.create({
        data: {
            date: new Date('2025-10-16T11:00:00Z'),
            timeSlot: '11:00-11:30',
            isBooked: false,
        },
    });

    // 2️⃣ Create appointments using the slot IDs
    await prisma.appointment.createMany({
        data: [
            {
                userName: 'Rohit Kumar',
                userEmail: 'rohit@example.com',
                userPhone: '9876543210',
                slotId: slot1.id,
                status: 'CONFIRMED',
            },
            {
                userName: 'Rohit Kumar',
                userEmail: 'rohit@example.com',
                userPhone: '9876543210',
                slotId: slot2.id,
                status: 'PENDING',
            },
        ],
    });

    console.log('Seed completed!');
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
