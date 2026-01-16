import { PrismaClient, UserRole, BlogStatus } from '@prisma/client'

const prisma = new PrismaClient()
// to seed content run this command
// npx prisma db seed

async function main() {
    console.log('Start seeding content...')

    // 1. Get an Author (Admin)
    let author = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN }
    });

    if (!author) {
        console.log("No admin found. Please create an admin first.");
        // break it if no admin is found
        throw new Error("No admin found. Please create an admin first.");
    }

    console.log(`Using Author: ${author.name} (${author.id})`);

    // 2. Blogs
    const deletBlog =await prisma.blog.deleteMany({});
    const deletResearch = await prisma.research.deleteMany({})
    console.log("Deleted Blogs and Research Papers");
    const blogCount = await prisma.blog.count();
    if (blogCount > 0) {
        console.log("Blogs already exist. Skipping blog seed.");
    } else {
        console.log("Seeding Blogs...");
        await prisma.blog.createMany({
            data: [
                {
                    title: "The Changing Landscape of Corporate Governance in India",
                    content: `
## Introduction
Corporate governance in India has undergone a paradigm shift over the last decade. With the introduction of the Companies Act, 2013, and subsequent amendments by SEBI, the focus has shifted from mere compliance to ethical leadership and transparency. This article explores the key pillars of the new governance framework.

### 1. The Role of Independent Directors
One of the most significant changes is the empowered role of independent directors. They are no longer passive observers but active custodians of minority shareholder interests. The law now mandates:
*   Strict criteria for independence.
*   Separate meetings of independent directors.
*   Performance evaluation of the entire board.

### 2. Related Party Transactions (RPTs)
RPTs have often been the conduit for corporate fraud. The new regime requires:

Prior audit committee approval for all RPTs and shareholder approval for material transactions. This ensures that funds are not siphoned off to promoter-owned entities at the expense of the company.

### 3. CSR: A Legal Mandate
India is one of the few countries to make Corporate Social Responsibility (CSR) mandatory. Companies meeting certain profitability criteria must spend 2% of their average net profits on social causes. This has moved CSR from the backroom to the boardroom.

## Conclusion
While the regulatory framework is robust, the true test lies in implementation. A culture of integrity cannot be legislated; it must be cultivated. As Indian companies go global, adhering to these high standards will be their competitive advantage.
                    `,
                    status: BlogStatus.APPROVED,
                    authorId: author.id,
                    thumbnailUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000",
                    createdAt: new Date()
                },
                {
                    title: "Artificial Intelligence in Law: Evolution or Revolution?",
                    content: `
## The AI Disruption
The legal profession, traditionally seen as resistant to change, is at the cusp of a technological revolution. Artificial Intelligence (AI) is not just automating routine tasks but is beginning to assist in complex legal research and predictive analytics.

### Automating Due Diligence
Reviewing thousands of contracts during mergers and acquisitions used to take teams of lawyers weeks. AI tools can now identify risks, anomalies, and critical clauses in a fraction of that time, reducing costs and human error.

### Predictive Justice?
Some jurisdictions are experimenting with AI to predict case outcomes based on precedents. While this aids in strategy, it raises ethical questions:

> "Can an algorithm understand the nuances of justice, or will it merely reinforce past biases?"

### The Human Element
Despite these advancements, the core of law—advocacy, negotiation, and ethical judgment—remains strictly human. AI is a tool for the lawyer, not a replacement. The lawyer of the future will be a hybrid professional: part legal expert, part tech-strategist.
                    `,
                    status: BlogStatus.APPROVED,
                    authorId: author.id,
                    thumbnailUrl: "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=1000",
                    createdAt: new Date(Date.now() - 86400000)
                },
                {
                    title: "RERA and the Homebuyer: A New Era of Rights",
                    content: `
## Understanding RERA
The Real Estate (Regulation and Development) Act, 2016 (RERA), was enacted to protect homebuyers and boost investments in the real estate industry. It brings transparency and accountability to a sector previously marred by delays and unfair practices.

### Key Protections for Buyers
1.  **Standardized Carpet Area:** Builders can no longer sell on 'super built-up area'. They must quote prices based on the actual usable carpet area.
2.  **Escrow Account:** 70% of the funds collected from buyers must be deposited in a separate bank account, ensuring money is used only for construction purposes.
3.  **Right to Information:** Developers must publish all project details, including approvals and timelines, on the RERA website.

### Impact on Developers
While compliance costs have increased, RERA has consolidated the market. Serious, organized players are thriving, while fly-by-night operators are being weeded out. This consolidation is healthy for the long-term stability of the housing market.
                    `,
                    status: BlogStatus.PENDING,
                    authorId: author.id,
                    thumbnailUrl: null,
                    createdAt: new Date(Date.now() - 172800000)
                }
            ]
        });
    }

    // 3. Research Papers
    const researchCount = await prisma.research.count();
    if (researchCount > 0) {
        console.log("Research papers already exist. Skipping research seed.");
    } else {
        console.log("Seeding Research Papers...");
        await prisma.research.createMany({
            data: [
                {
                    title: "The Personal Data Protection Bill: A Critical Analysis",
                    description: "An in-depth review of India's proposed data protection laws, comparing them with GDPR and analyzing their impact on digital businesses.",
                    content: `
# The Personal Data Protection Bill: A Critical Analysis
**Abstract:** In an increasingly digital economy, data is the new oil. The Personal Data Protection (PDP) Bill seeks to regulate how personal data of individuals is processed by the government and private entities incorporated in India and abroad.

## 1. Introduction
The Supreme Court's landmark judgment in *K.S. Puttaswamy v. Union of India* declared the Right to Privacy a fundamental right. This necessitated a robust legislative framework to protect user data. The PDP Bill is the government's response to this mandate.

## 2. Key Features of the Bill
### 2.1 Data Fiduciaries and Principals
The Bill introduces the concepts of 'Data Fiduciary' (those who determine the purpose of processing) and 'Data Principal' (the individual). Fiduciaries are placed under an obligation to process data fairly and reasonably.

### 2.2 Consensus and Rights
Explicit consent is the bedrock of the Bill. Data Principals have the right to confirmation, access, correction, and the right to be forgotten. However, the legislation also provides for processing without consent for 'reasonable purposes' such as security and preventing fraud.

## 3. Comparison with GDPR
While modeled on the EU's GDPR, the PDP Bill diverges in key areas, specifically regarding data localization. The mandate to store 'critical' personal data only in India has sparked debate about surveillance and the cost of doing business.

## 4. Conclusion
The PDP Bill is a necessary step towards digital sovereignty. However, balancing privacy rights with the needs of a growing digital economy and national security remains a delicate act. The final form of the Act will determine the future of India's internet ecosystem.
                    `,
                    createdById: author.id,
                    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    thumbnailUrl: "https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=1000"
                },
                {
                    title: "Environmental Jurisprudence vs. Industrial Growth",
                    description: "Exploring the conflict between economic development and environmental sustainability through recent Supreme Court judgments.",
                    content: `
# Environmental Jurisprudence vs. Industrial Growth
## Executive Summary
This paper examines the evolving stance of the Indian judiciary in balancing the often conflicting goals of industrial development and environmental conservation.

## Historical Context
From the Oleum Gas Leak case to the recent bans on firecrackers, the Indian Supreme Court has often acted as the guardian of the environment, invoking the 'Polluter Pays' and 'Precautionary' principles.

## Case Study: The Coastal Regulation Zone (CRZ)
Recent amendments to CRZ norms have relaxed restrictions to boost tourism and infrastructure. Critics argue this endangers fragile coastal ecosystems. This paper analyzes the legal challenges filed against these notifications and the court's preliminary observations.

## The Way Forward
Sustainable development cannot be a zero-sum game. The legal framework must evolve to incentivize green technologies rather than just penalizing pollution. We propose a new model of 'Environmental Impact Assessment' that is both rigorous and time-bound prevents bureaucratic paralysis while ensuring ecological integrity.
                    `,
                    createdById: author.id,
                    fileUrl: null,
                    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000"
                }
            ]
        });
    }
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
