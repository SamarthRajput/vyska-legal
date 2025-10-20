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
            {
                title: title,
                content: article,
                status: 'APPROVED',
                authorId: admin.id,
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

    // // Create Research
    // await prisma.research.createMany({
    //     data: [
    //         {
    //             title: 'Corporate Law Whitepaper',
    //             description: 'An in-depth analysis of corporate regulations.',
    //             fileUrl: 'https://example.com/corporate-law.pdf',
    //             uploadedById: admin.id,
    //         },
    //         {
    //             title: 'Intellectual Property Research',
    //             description: 'Study on recent trends in IP law.',
    //             fileUrl: 'https://example.com/ip-research.pdf',
    //             uploadedById: user1.id,
    //         },
    //     ],
    // })
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
    // const slot1 = await prisma.appointmentSlot.create({
    //     data: {
    //         date: new Date('2025-10-15T09:00:00Z'),
    //         timeSlot: '09:00-09:30',
    //         isBooked: false,
    //     },
    // });

    // const slot2 = await prisma.appointmentSlot.create({
    //     data: {
    //         date: new Date('2025-10-16T11:00:00Z'),
    //         timeSlot: '11:00-11:30',
    //         isBooked: false,
    //     },
    // });

    // // 2️⃣ Create appointments using the slot IDs
    // await prisma.appointment.createMany({
    //     data: [
    //         {
    //             userName: 'Rohit Kumar',
    //             userEmail: 'rohit@example.com',
    //             userPhone: '9876543210',
    //             slotId: slot1.id,
    //             status: 'CONFIRMED',
    //         },
    //         {
    //             userName: 'Rohit Kumar',
    //             userEmail: 'rohit@example.com',
    //             userPhone: '9876543210',
    //             slotId: slot2.id,
    //             status: 'PENDING',
    //         },
    //     ],
    // });

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


const title = 'The Evolution and Impact of Data Privacy Laws in India';
const article = `

### *Introduction*

In the digital age, data has become one of the most valuable assets in the world. Every click, search, and transaction generates data, creating vast digital footprints that are stored, analyzed, and often monetized by organizations. However, this immense power of data has also brought forth a serious concern — *data privacy*.
In India, where internet penetration has crossed 800 million users, the debate around personal data protection has grown significantly over the last decade. The journey from having almost no data protection law to the enactment of the *Digital Personal Data Protection Act, 2023* marks a monumental shift in India’s legal landscape.

---

### *Historical Background of Data Privacy in India*

Before the recent legislative developments, India’s data protection framework was scattered across various laws. The most significant among them was the *Information Technology (IT) Act, 2000*, and its subsequent amendment in 2008.

Under Section 43A of the IT Act, companies were made liable to compensate individuals if they failed to protect their personal data. Additionally, the *Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011* provided a limited safeguard against misuse of sensitive personal data like passwords, medical records, and financial details.

However, these provisions were narrow, lacked enforcement mechanisms, and were not comprehensive enough to address modern challenges like data profiling, algorithmic bias, or cross-border data transfers.

---

### *The Turning Point: Justice K.S. Puttaswamy vs. Union of India (2017)*

A landmark moment came with the Supreme Court’s judgment in *Justice K.S. Puttaswamy (Retd.) vs. Union of India*, 2017, where the Court unanimously declared *the right to privacy* as a *fundamental right* under Article 21 of the Constitution.

The judgment recognized informational privacy — the right of an individual to control their personal data — as an essential component of the right to life and personal liberty. This ruling created the constitutional foundation for a comprehensive data protection regime in India.

---

### *Journey Toward a Dedicated Data Protection Law*

Following the Supreme Court’s ruling, the government established a committee chaired by Justice B.N. Srikrishna to draft a data protection law. The committee’s 2018 report emphasized the principles of consent, purpose limitation, and data minimization, leading to the *Personal Data Protection Bill, 2019 (PDP Bill)*.

However, after years of debate and multiple revisions, the government withdrew the PDP Bill and introduced a simpler and more business-friendly version — the *Digital Personal Data Protection Act, 2023 (DPDP Act)*, which officially came into effect in August 2023.

---

### *Key Provisions of the Digital Personal Data Protection Act, 2023*

The DPDP Act, 2023, represents India’s first comprehensive data protection legislation. Some of its major provisions include:

1. **Applicability**
   The Act applies to the processing of digital personal data within India and to data processed outside India if related to offering goods or services to Indian citizens.

2. **Consent Framework**
   The Act mandates that personal data can be processed only with *free, specific, informed, and unambiguous consent* from individuals (called *Data Principals*).

3. **Rights of Individuals**
   The law grants individuals the right to:

   * Access their personal data.
   * Request correction or deletion.
   * Withdraw consent.
   * Seek grievance redressal.

4. **Obligations of Data Fiduciaries**
   Entities processing data (*Data Fiduciaries*) must ensure accuracy, implement security safeguards, and notify breaches.

5. **Data Protection Board of India (DPBI)**
   The Act establishes a Data Protection Board to monitor compliance, handle complaints, and impose penalties.

6. **Penalties**
   The law imposes heavy penalties — up to ₹250 crore for violations such as data breaches or failure to implement security safeguards.

7. **Cross-Border Data Transfer**
   The Act permits data transfer to countries notified by the government, balancing data sovereignty with global trade needs.

---
![Data Privacy](https://imgs.search.brave.com/1pbIYxTnk8-S4C8Q9qPpXMPuqMd5xjE7yo4eB4RFzuY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/Y3JlYXRlLnZpc3Rh/LmNvbS9hcGkvbWVk/aWEvc21hbGwvNjc4/NzExMDUvc3RvY2st/cGhvdG8tcHJpdmFj/eS1wb2xpY3k)
---

### *Balancing Privacy with Innovation*

While the DPDP Act is a milestone, it also seeks to maintain a delicate balance between individual privacy and the need for innovation. India’s booming digital economy, valued at over $200 billion, depends on the free flow of data across borders.

The Act’s framework allows businesses — especially startups and tech companies — to innovate while still adhering to data protection norms. By simplifying compliance and introducing consent-based frameworks, India aims to position itself as a global hub for responsible digital innovation.

---

### *Comparison with Global Data Protection Frameworks*

The DPDP Act draws inspiration from global laws like the *European Union’s General Data Protection Regulation (GDPR)* but is comparatively less stringent.

| Aspect                | GDPR (EU)                   | DPDP Act (India)           |
| --------------------- | --------------------------- | -------------------------- |
| Consent               | Explicit and detailed       | Simplified, broader        |
| Right to be forgotten | Strongly enforced           | Limited scope              |
| Regulator             | Independent authority       | Government-appointed Board |
| Penalties             | Up to 4% of global turnover | Up to ₹250 crore           |

This lighter regulatory approach is designed to foster digital growth while progressively strengthening privacy culture in India.

---

### *Challenges Ahead*

Despite its promise, several challenges lie ahead:

1. **Implementation Gap** – Establishing the Data Protection Board and building compliance infrastructure will take time.
2. **Public Awareness** – Many citizens are still unaware of their digital rights.
3. **Government Exemptions** – The Act grants wide exemptions to government agencies, raising concerns about potential misuse.
4. **Data Localization Ambiguity** – The absence of clear localization requirements may pose cybersecurity risks.

Addressing these challenges will determine the law’s real-world success.

---

### *Conclusion*

India’s journey toward ensuring digital privacy reflects the nation’s evolving understanding of the relationship between technology and human rights. The *Digital Personal Data Protection Act, 2023* is not just a legal reform but a societal transformation — one that seeks to empower individuals, ensure accountability, and build trust in the digital ecosystem.

As India continues to digitize everything from healthcare to governance, the protection of personal data will play a pivotal role in defining the future of its democracy and economy.
Ultimately, a culture of *privacy by design* — where every digital innovation respects individual rights — will be the true measure of progress in the years to come.
`;