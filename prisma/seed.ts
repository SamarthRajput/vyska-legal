import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// to run this seed file use this command in terminal
// npx prisma db seed

async function main() {
    console.log('Start seeding...')

    // deleting all data
    await prisma.heroSlide.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.fAQ.deleteMany();
    await prisma.companyInfo.deleteMany();

    // 1. Hero Slides
    const heroSlideCount = await prisma.heroSlide.count();
    if (heroSlideCount === 0) {
        console.log('Seeding Hero Slides...');
        await prisma.heroSlide.createMany({
            data: [
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
                    isActive: true
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
                    isActive: true
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
                    isActive: true
                }
            ]
        });
    } else {
        console.log('Hero Slides already exist, skipping.');
    }

    // 2. Testimonials
    const testimonialCount = await prisma.testimonial.count();
    if (testimonialCount === 0) {
        console.log('Seeding Testimonials...');
        await prisma.testimonial.createMany({
            data: [
                {
                    name: "Neha & Rakesh",
                    caseType: "Adoption Case",
                    message: "They handled our adoption case with so much care. on every hearing—they were there. We're finally a family, and we couldn't have done it without them.",
                    imageUrl: "/neha.png",
                    order: 1,
                    isActive: true
                },
                {
                    name: "Arjun sharma",
                    caseType: "Business Law Case",
                    message: "We needed quick legal advice on a vendor contract. The team was sharp, responsive, and helped us avoid a costly mistake. Definitely our go-to now.",
                    imageUrl: "/neha.png",
                    order: 2,
                    isActive: true
                },
                {
                    name: "Shivam taneja",
                    caseType: "Property Case",
                    message: "I needed a will and property agreement done quickly. They were clear, professional, and didn't drown me in legal jargon. Just did what I needed.",
                    imageUrl: "/neha.png",
                    order: 3,
                    isActive: true
                },
                {
                    name: "Test Client",
                    caseType: "Criminal Case",
                    message: "Amazing service and support throughout my case.",
                    imageUrl: "/neha.png",
                    order: 4,
                    isActive: true
                }
            ]
        });
    } else {
        console.log('Testimonials already exist, skipping.');
    }

    // 3. FAQs
    const faqCount = await prisma.fAQ.count();
    if (faqCount === 0) {
        console.log('Seeding FAQs...');
        await prisma.fAQ.createMany({
            data: [
                {
                    question: "Is remote legal assistance available ?",
                    answer: "Yes! We offer remote consultations and document support across India. For court representation, we'll guide you based on your location and case type.",
                    order: 1,
                    isActive: true
                },
                {
                    question: "What documents do I need for a divorce case?",
                    answer: "Typically, you'll need marriage certificate, ID proof & any evidence supporting your claims. We'll help you organize everything during your first session.",
                    order: 2,
                    isActive: true
                },
                {
                    question: "Is my information kept confidential?",
                    answer: "Absolutely. Your data and case details are handled with strict confidentiality and legal compliance.",
                    order: 3,
                    isActive: true
                },
                {
                    question: "What is your pricing structure?",
                    answer: "Fees vary by service. We offer transparent pricing upfront—starting from ₹2,500 for document drafting and ₹5,000 for consultations. Complex cases are quoted individually.",
                    order: 4,
                    isActive: true
                }
            ]
        });
    } else {
        console.log('FAQs already exist, skipping.');
    }

    // 4. Company Info
    const companyInfoCount = await prisma.companyInfo.count();
    if (companyInfoCount === 0) {
        console.log('Seeding Company Info...');
        const companyInfo = await prisma.companyInfo.create({
            data: {
                email: "contact@vyskalegal.com",
                phone: "+91 12345 67890",
                whatsapp: "https://wa.me/911234567890",
                address: "Sector 62, Noida, Uttar Pradesh, India",
                yearsExperience: "25+",
                successRate: "98%",
                trustedClients: "150+",
                casesWon: "500+",
                headOffice: "New Delhi",
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e2f4d69%3A0x6d4b5e9a7fcbe08d!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1697543210000!5m2!1sen!2sin",
                disclaimerMessage: "The rules of the Bar Council of India prohibit law firms from soliciting work or advertising in any manner. By clicking on \"I AGREE\", the user acknowledges that:",
                disclaimerPoints: [
                    "The user wishes to gain more information about Us for his/her/their own information and use.",
                    "There has been no advertisement, personal communication, solicitation, invitation or inducement of any sort whatsoever from Us or any of our members to solicit any work through this website.",
                    "The information about Us is provided to the user only on his/her/their specific request and any information obtained or downloaded from this website is completely at the user’s volition and any transmission, receipt or use of this site would not create any lawyer-client relationship.",
                    "The information provided under this website is solely available at your request for informational purposes only, should not be interpreted as soliciting or advertisement.",
                    "We are not liable for any consequence of any action taken by the user relying on material / information provided under this website. In cases where the user has any legal issues, he/she in all cases must seek independent legal advice."
                ]
            }
        });
        console.log('Company Info seeded successfully.', companyInfo);
    } else {
        console.log('Company Info already exists, skipping.');
    }

    console.log('Seeding finished.')
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