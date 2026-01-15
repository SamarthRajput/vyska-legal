import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// to run this seed file use this command in terminal
// npx prisma db seed

async function main() {
    console.log('Start seeding...')

    await prisma.heroSlide.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.fAQ.deleteMany();
    await prisma.companyInfo.deleteMany();
    await prisma.teamMember.deleteMany();

    // 1. Hero Slides
    console.log('Seeding Hero Slides...');
    await prisma.heroSlide.createMany({
        data: [
            // OLD SLIDES (Inactive)
            {
                title: "Legal clarity begins with",
                highlight: "conversations",
                description: "We're here to listen, guide, and act—making legal decisions easier and more confident for you",
                buttonText: "Get help now",
                buttonLink: "/contact",
                imageUrl: "/grouppic.png",
                order: 1,
                type: "fullBackground",
                bgColor: "from-blue-900 via-blue-800 to-gray-900",
                isActive: false
            },
            {
                title: "When Everything's at Stake, We're",
                highlight: "With You",
                description: "Our team of legal experts stands united to protect your rights, with strategy, compassion & conviction.",
                buttonText: "Explore now",
                buttonLink: "/about",
                imageUrl: "/officepic.jpg",
                order: 2,
                type: "split",
                bgColor: "from-slate-900 to-gray-800",
                isActive: false
            },
            {
                title: "Serving people with",
                highlight: "Integrity",
                description: "Visit our office or connect online, our doors are open for everyone.",
                buttonText: "Visit us today",
                buttonLink: "/contact",
                imageUrl: "/doorpic.png",
                order: 3,
                type: "split",
                bgColor: "from-indigo-900 to-slate-900",
                isActive: false
            },
            // NEW SLIDES (Active)
            {
                title: "Empowering Your Legal Journey with",
                highlight: "Integrity",
                description: "Vyska Legal: A full-service law firm delivering modern, ethical, and client-centric solutions in Prayagraj & NCR.",
                buttonText: "Our Practice Areas",
                buttonLink: "/services",
                imageUrl: "/officepic.jpg",
                order: 1,
                type: "fullBackground",
                bgColor: "from-blue-900 via-blue-800 to-gray-900",
                isActive: true
            },
            {
                title: "Justice, Trust, and",
                highlight: "Innovation",
                description: "Combining deep legal expertise with a modern approach to serve individuals, startups, and corporations.",
                buttonText: "Meet Our Team",
                buttonLink: "/about",
                imageUrl: "/grouppic.png",
                order: 2,
                type: "split",
                bgColor: "from-slate-900 to-gray-800",
                isActive: true
            }
        ]
    });

    // 2. Practice Areas
    console.log('Seeding Practice Areas...');
    // Clear existing data first
    await prisma.practiceArea.deleteMany();

    await prisma.practiceArea.createMany({
        data: [
            { title: "Corporate & Commercial Law", description: "Incorporation, M&A, contracts, and regulatory compliance for businesses.", order: 1 },
            { title: "Litigation & Dispute Resolution", description: "Representation in civil, criminal, and commercial litigation, arbitration & mediation.", order: 2 },
            { title: "Real Estate & Property Law", description: "Sale/purchase, due diligence, RERA compliance, and property disputes.", order: 3 },
            { title: "Banking & Finance", description: "Advisory on loans, securities, debt recovery, and financial restructuring.", order: 4 },
            { title: "Intellectual Property Rights (IPR)", description: "Protection and enforcement of copyrights, trademarks, patents, and trade secrets.", order: 5 },
            { title: "Family Law", description: "Compassionate counsel for divorce, custody, adoption, and inheritance matters.", order: 6 },
            { title: "Employment & Labour Law", description: "Employment contracts, workplace policies, compliance, and dispute resolution.", order: 7 },
            { title: "Taxation Law", description: "Advisory and litigation for direct/indirect taxes, GST, and tax planning.", order: 8 },
            { title: "Consumer Protection", description: "Representing consumers and businesses in disputes and product liability cases.", order: 9 },
            { title: "Environmental Law", description: "Compliance with environmental regulations and representation in litigation.", order: 10 },
            { title: "Technology & Data Privacy", description: "IT law, data protection, cybersecurity, and digital transaction advisory.", order: 11 },
            { title: "Alternative Dispute Resolution", description: "Efficient dispute resolution through arbitration, mediation, and conciliation.", order: 12 }
        ]
    });

    // 3. Testimonials
    console.log('Seeding Testimonials...');
    await prisma.testimonial.createMany({
        data: [
            {
                name: "Corporate Client",
                caseType: "Corporate Restructuring",
                message: "Vyska Legal provided clear, timely, and effective legal advice during our company’s restructuring. Their team was responsive, knowledgeable, and always acted in our best interests. We highly recommend their services.",
                imageUrl: null,
                order: 1,
                isActive: true
            },
            {
                name: "Neha & Rakesh",
                caseType: "Adoption Case",
                message: "They handled our adoption case with so much care. on every hearing—they were there. We're finally a family, and we couldn't have done it without them.",
                imageUrl: "/neha.png",
                order: 2,
                isActive: true
            },
            {
                name: "Real Estate Developer",
                caseType: "Regulatory Dispute",
                message: "The firm conducted comprehensive due diligence and represented us in arbitration. We achieved regulatory compliance and resolved disputes amicably thanks to Vyska Legal.",
                imageUrl: null,
                order: 3,
                isActive: true
            },
            {
                name: "Arjun Sharma",
                caseType: "Business Law Case",
                message: "We needed quick legal advice on a vendor contract. The team was sharp, responsive, and helped us avoid a costly mistake. Definitely our go-to now.",
                imageUrl: "/neha.png",
                order: 4,
                isActive: true
            }
        ]
    });

    // 3. FAQs
    console.log('Seeding FAQs...');
    await prisma.fAQ.createMany({
        data: [
            {
                question: "What areas of law does Vyska Legal practice?",
                answer: "We are a full-service firm covering Corporate & Commercial, Litigation, Real Estate, Banking & Finance, IPR, Family Law, Employment, Taxation, Consumer Protection, Environmental Law, and Technology Law.",
                order: 1,
                isActive: true
            },
            {
                question: "Where is Vyska Legal located?",
                answer: "Our registered office is in Allahabad (Prayagraj), Uttar Pradesh. We serve clients across the National Capital Region (NCR) and North India.",
                order: 2,
                isActive: true
            },
            {
                question: "Do you offer pro bono services?",
                answer: "Yes, we are committed to social responsibility and offer pro bono legal aid to underprivileged individuals and engage in community legal awareness programs.",
                order: 3,
                isActive: true
            },
            {
                question: "How do you charge for your services?",
                answer: "We offer flexible models including retainer agreements, project-based fixed fees, and hourly billing. All fees are transparent and agreed upon in advance.",
                order: 4,
                isActive: true
            },
            {
                question: "Is remote legal assistance available?",
                answer: "Yes! We offer remote consultations and document support. We leverage technology like video conferencing and secure file sharing for seamless remote collaboration.",
                order: 5,
                isActive: true
            }
        ]
    });

    // 4. Company Info
    console.log('Seeding Company Info...');
    await prisma.companyInfo.create({
        data: {
            email: "vyskalegal@outlook.com",
            phone: "+91 96167 00999",
            whatsapp: "https://wa.me/919616700999",
            address: "B-11, 1st Floor, Vinayak City Square, Sardar Patel Marg, Civil Lines, Prayagraj, UP 211001",
            yearsExperience: "10+", // Based on partners experience
            successRate: "98%",
            trustedClients: "200+",
            casesWon: "500+",
            headOffice: "Prayagraj",
            mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.769717646636!2d81.833!3d25.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDI3JzAwLjAiTiA4McKwNTAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1635764000000!5m2!1sen!2sin", // Placeholder map coord, user can update
            disclaimerMessage: "The rules of the Bar Council of India prohibit law firms from soliciting work or advertising in any manner. By clicking on \"I AGREE\", the user acknowledges that:",
            disclaimerPoints: [
                "The user wishes to gain more information about Us for his/her/their own information and use.",
                "There has been no advertisement, personal communication, solicitation, invitation or inducement of any sort whatsoever from Us or any of our members to solicit any work through this website.",
                "The information about Us is provided to the user only on his/her/their specific request and any information obtained or downloaded from this website is completely at the user’s volition and any transmission, receipt or use of this site would not create any lawyer-client relationship.",
                "The information provided under this website is solely available at your request for informational purposes only, should not be interpreted as soliciting or advertisement.",
                "We are not liable for any consequence of any action taken by the user relying on material / information provided under this website. In cases where the user has any legal issues, he/she in all cases must seek independent legal advice."
            ],
            // Socials
            linkedinUrl: "https://linkedin.com",
            facebookUrl: "https://facebook.com",
            twitterUrl: "https://twitter.com"
        }
    });

    // 5. Team Members
    console.log('Seeding Team Members...');
    await prisma.teamMember.createMany({
        data: [
            {
                name: "Adv. Vibhu Garg",
                role: "Managing Partner",
                biography: "Leads the corporate and commercial division with 10 years of experience. Advises on business formation, compliance, M&A, and handles complex financial and criminal litigation.",
                photoUrl: null
            },
            {
                name: "Adv. Anjana Tiwari",
                role: "Designated Partner",
                biography: "Heads the family and civil law practice with over 10 years of experience. Expert in matrimonial, inheritance, and property disputes, known for equitable and timely resolutions.",
                photoUrl: null
            },
            {
                name: "Adv. Yash Tiwari",
                role: "Partner",
                biography: "Oversees taxation, commercial, and financial law. Exceptional expertise in GST compliance, corporate taxation, and commercial advisory with 3 years of experience.",
                photoUrl: null
            },
            {
                name: "Adv. Vibhanshu Srivastava",
                role: "Associate",
                biography: "Specializes in IPR and consumer protection. Represents clients in consumer commissions and debt recovery tribunals.",
                photoUrl: null
            },
            {
                name: "Adv. Vivek Shukla",
                role: "Associate",
                biography: "Expert in civil and cyber law, assisting in property disputes, data protection compliance, and digital rights enforcement.",
                photoUrl: null
            },
            {
                name: "Mr. Khushal",
                role: "Support Staff",
                biography: "Provides essential logistical and administrative support, ensuring smooth case management and court filings.",
                photoUrl: null
            }
        ]
    });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })