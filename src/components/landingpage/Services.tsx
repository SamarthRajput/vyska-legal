import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, CircleArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function Services() {
    const services = await prisma.practiceArea.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        take: 6
    });

    return (
        <section
            className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-x-hidden"
            style={{
                background: 'linear-gradient(180deg, #EAEFFF 0%, #AFC3FF 100%)'
            }}
        >
            <div className="max-w-7xl mx-auto">
                <h3 className="mb-8 text-[32px] leading-[36px] sm:text-[28px] sm:leading-[42px] md:text-[32px] md:leading-[48px] font-lato">
                    <span className="text-blue-700">Our areas of expertise</span><span> from urgent cases to long-term <br />planning—we’re here to help.</span>
                </h3>

                <div className="hidden xl:grid xl:grid-cols-3 gap-8 items-stretch">
                    <div className="flex flex-col space-y-6">
                        {services.slice(0, 3).map((service) => (
                            <div
                                key={service.id}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-[#224099] border-b-3 hover:shadow-lg transition-shadow flex-1"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                                        {service.title}
                                    </h3>
                                    <div className="-rotate-40">
                                        <CircleArrowRight className="w-7 h-7 text-black " />
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm lg:text-base">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                            src="/court.png"
                            alt="Legal services"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="flex flex-col space-y-6">
                        {services.slice(3, 9).map((service) => (
                            <div
                                key={service.id}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-[#224099] border-b-3 hover:shadow-lg transition-shadow flex-1"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                                        {service.title}
                                    </h3>
                                    <div className="-rotate-40">
                                       <CircleArrowRight className="w-7 h-7 text-black " />
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm lg:text-base">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border-2 border-blue-300 border-b-4 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 pr-2">
                                    {service.title}
                                </h3>
                                <div className="bg-white rounded-full p-2 border border-gray-300 flex-shrink-0">
                                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                                </div>
                            </div>
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="text-right mt-6 sm:mt-8 md:mt-10">
                    <Link
                        href="/services"
                        className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 hover:text-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                        View more...
                    </Link>
                </div>
            </div>
        </section>
    )
}