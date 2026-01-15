
import { prisma } from "@/lib/prisma"
import Link from 'next/link'
import { ArrowUpRight, Scale, ShieldCheck, Briefcase, Calculator, Building, Users } from 'lucide-react'

export const revalidate = 0;

export default async function ServicesPage() {
    const [services, companyInfo] = await Promise.all([
        prisma.practiceArea.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        }),
        prisma.companyInfo.findFirst()
    ]);

    const phoneNumber = companyInfo?.phone || '+919616700999';
    const telLink = `tel:${phoneNumber.replace(/\s+/g, '')}`;

    return (
        <div className="min-h-screen bg-neutral-50 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white min-h-[400px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-neutral-50/10"></div>
                <div className="max-w-7xl mx-auto text-center relative z-10 px-4 py-20">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-800/50 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6 tracking-wide uppercase">
                        Our Expertise
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        Legal Excellence <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200">Tailored to You</span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed font-light">
                        Comprehensive legal solutions designed for clarity, integrity, and results. We navigate the complexities so you don't have to.
                    </p>
                </div>
            </div>
            <div className="mt-10" />
            {/* Services Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={service.id}
                            className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full transform hover:-translate-y-1"
                        >
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                                        <Scale className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">0{index + 1}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed mb-6 flex-1 text-[15px]">
                                    {service.description}
                                </p>
                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <Link href="/book-appointments" className="flex items-center gap-2 group/link">
                                        <span className="text-blue-600 font-semibold text-sm tracking-wide group-hover/link:underline decoration-blue-300 underline-offset-4">Book Consultation</span>
                                        <ArrowUpRight className="w-4 h-4 text-blue-600 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                    </Link>
                                </div>
                            </div>
                            <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="pb-24 pt-10 px-4">
                <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2.5rem] p-10 md:p-20 shadow-2xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to Discuss Your Case?</h2>
                        <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto font-light">
                            Connect with our expert legal team today. We are here to listen, understand, and provide the guidance you need.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center">
                            <Link
                                href="/book-appointments"
                                className="inline-flex items-center justify-center bg-white text-blue-900 font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 hover:bg-neutral-100"
                            >
                                Book a Consultation
                            </Link>
                            <Link
                                href={telLink}
                                className="inline-flex items-center justify-center bg-transparent border-2 border-blue-400/30 text-white font-bold py-4 px-10 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm"
                            >
                                <span>Call Us Now</span>
                            </Link>
                        </div>
                        <p className="mt-8 text-sm text-blue-300/60">
                            Or email us at <span className="text-blue-200">{companyInfo?.email || 'vyskalegal@outlook.com'}</span>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
