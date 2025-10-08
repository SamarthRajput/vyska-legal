"use client";
import React, { useEffect } from 'react'
import { toast } from 'sonner';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    biography: string | null;
    photoUrl: string | null;
    createdAt: string;
    updatedAt: string;
    createdById: string | null;
}

const About = () => {
    const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    // Fetch all team members
    const fetchTeamMembers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/team-member');
            if (!response.ok) throw new Error('Failed to fetch team members');
            const data = await response.json();
            setTeamMembers(data);
        } catch (error) {
            toast.error('Error fetching team members', {
                description: (error as Error).message,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-b from-white via-blue-50 to-white min-h-screen">
            <section className="mb-16">
                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-6 text-center">About <span className="italic">Vyska Legal</span></h1>
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="flex-1">
                        <p className="mb-4 text-lg md:text-xl text-gray-700 leading-relaxed">
                            At <span className="font-semibold italic">Vyska Legal</span>, we believe that justice, integrity, and innovation are the pillars of a progressive society. Established with a vision to redefine the way legal services are delivered, our firm combines deep legal expertise with a modern, client-centric approach.
                        </p>
                        <p className="mb-4 text-lg md:text-xl text-gray-700 leading-relaxed">
                            We are committed to providing strategic, reliable, and result-oriented legal solutions to individuals, startups, and corporations across various sectors. From corporate compliance to intellectual property and litigation, our goal is to simplify legal complexities through expertise, research, and technology-driven insights.
                        </p>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <img
                            src="/about-illustration.svg"
                            alt="About Vyska Legal"
                            className="w-64 h-64 object-contain rounded-xl shadow-lg border border-blue-100 bg-white"
                            aria-hidden="true"
                        />
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-2 text-blue-900">Our Mission</h2>
                        <p className="text-gray-700 leading-relaxed">
                            To empower businesses and individuals by providing accessible, transparent, and effective legal support while upholding the highest standards of ethics and professionalism.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-2 text-blue-900">Our Vision</h2>
                        <p className="text-gray-700 leading-relaxed">
                            To be recognized as a leading legal firm known for innovation, research excellence, and a commitment to shaping the future of law in India and beyond.
                        </p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold mb-2 text-blue-900">Our Values</h2>
                        <ul className="list-disc pl-5 space-y-1 text-gray-700">
                            <li><span className="font-semibold italic">Integrity</span> – We uphold honesty and ethical standards in every case.</li>
                            <li><span className="font-semibold italic">Excellence</span> – We strive for perfection through research, preparation, and dedication.</li>
                            <li><span className="font-semibold italic">Innovation</span> – We adapt and evolve with changing legal landscapes.</li>
                            <li><span className="font-semibold italic">Client-Centric Approach</span> – We prioritize every client’s unique needs and goals.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 shadow-sm">
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">Why Choose Us?</h2>
                    <ul className="grid gap-4 md:grid-cols-2 list-none">
                        <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl mt-1">✔️</span>
                            <span>
                                <span className="font-semibold">Experienced Legal Team:</span> Our lawyers bring years of expertise across diverse legal domains.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl mt-1">✔️</span>
                            <span>
                                <span className="font-semibold">Transparent Communication:</span> We keep you informed at every stage of your case.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl mt-1">✔️</span>
                            <span>
                                <span className="font-semibold">Cutting-edge Research:</span> Our team leverages technology and research for optimal outcomes.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl mt-1">✔️</span>
                            <span>
                                <span className="font-semibold">Personalized Solutions:</span> Every client receives tailored legal strategies.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl mt-1">✔️</span>
                            <span>
                                <span className="font-semibold">Prompt Response:</span> We value your time and respond quickly to your queries.
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-600 text-xl mt-1">✔️</span>
                            <span>
                                <span className="font-semibold">Ethical Practice:</span> We adhere to the highest standards of legal ethics and confidentiality.
                            </span>
                        </li>
                    </ul>
                </div>
            </section>

            <hr className="my-12 border-gray-200" />

            <section>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900 text-center">Our Team</h2>
                <p className="mb-8 text-gray-700 leading-relaxed max-w-3xl mx-auto text-center">
                    Behind Vyska Legal is a dynamic and dedicated team of lawyers, researchers, and strategists who bring together experience, creativity, and passion for justice.<br />
                    Each member of our team plays a vital role in strengthening our foundation through research, advocacy, and collaboration. Their collective expertise ensures that every client receives personalized attention and well-rounded legal solutions.<br />
                    Explore the professionals who make <span className="font-semibold italic">Vyska Legal</span> what it is today.
                </p>
                {loading ? (
                    <div className="text-center py-12 text-gray-500 text-lg">Loading team members...</div>
                ) : (
                    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {teamMembers.length === 0 ? (
                            <div className="col-span-full text-center text-gray-400 text-lg">No team members found.</div>
                        ) : (
                            teamMembers.map(member => (
                                <article
                                    key={member.id}
                                    className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-200 border border-gray-100 group"
                                    aria-label={`Team member: ${member.name}`}
                                >
                                    <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-blue-100 group-hover:border-blue-400 transition-colors duration-200">
                                        {member.photoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={member.photoUrl}
                                                alt={member.name}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <span className="text-4xl font-bold text-blue-600 flex items-center justify-center w-full h-full">
                                                {member.name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                                    <p className="text-blue-700 font-medium mb-2">{member.role}</p>
                                    {member.biography && (
                                        <p className="text-gray-600 text-sm leading-relaxed">{member.biography}</p>
                                    )}
                                    <div className="mt-3">
                                        <a
                                            href="#"
                                            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors"
                                            aria-label={`LinkedIn profile of ${member.name}`}
                                            tabIndex={-1}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76 1.75.79 1.75 1.76-.78 1.76-1.75 1.76zm15.5 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.89v1.36h.04c.4-.76 1.38-1.56 2.85-1.56 3.05 0 3.61 2.01 3.61 4.62v5.58z"/>
                                            </svg>
                                            LinkedIn
                                        </a>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                )}
            </section>

            <section className="mt-16 mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Ready to get started?</h3>
                        <p className="text-blue-50 text-lg">Contact us today for a confidential consultation and discover how we can help you.</p>
                    </div>
                    <a
                        href="/contact"
                        className="inline-block bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-blue-50 transition-colors text-lg"
                        aria-label="Contact Vyska Legal"
                    >
                        Contact Us
                    </a>
                </div>
            </section>
        </main>
    );
};

export default About;
