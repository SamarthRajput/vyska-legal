import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function Services() {
    const services = [
        {
            id: 1,
            title: "Family Law services",
            description: "Compassionate support for divorce, custody, and domestic matters."
        },
        {
            id: 2,
            title: "Corporate & business law",
            description: "Strategic legal counsel for startups, SMEs, and enterprises."
        },
        {
            id: 3,
            title: "Documentation & legal drafting",
            description: "Clear accurate legal documents tailored to your needs."
        },
        {
            id: 4,
            title: "Civil litigation",
            description: "Assertive representation in property, contract and personal disputes."
        },
        {
            id: 5,
            title: "Criminal Defense",
            description: "Protecting your rights with experienced legal defense."
        },
        {
            id: 6,
            title: "Consultation & advisory",
            description: "One on one legal guidance for individuals and businesses."
        }
    ]

    return (
        <section 
            className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-28 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
            style={{
                background: 'linear-gradient(180deg, #EAEFFF 0%, #AFC3FF 100%)'
            }}
        >
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-8 sm:mb-10 md:mb-12 lg:mb-16 leading-tight text-center">
                    <span className="text-blue-700">Our areas of expertise</span> from urgent cases to long-term planning—we're here to help.
                </h2>

                <div className="hidden xl:grid xl:grid-cols-3 gap-8 items-stretch">
                    <div className="flex flex-col space-y-6">
                        {services.slice(0, 3).map((service) => (
                            <div 
                                key={service.id}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-300 border-b-4 hover:shadow-lg transition-shadow flex-1"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                                        {service.title}
                                    </h3>
                                    <div className="bg-white rounded-full p-2 border border-gray-300">
                                        <ArrowUpRight className="w-5 h-5 text-gray-700" />
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
                        {services.slice(3, 6).map((service) => (
                            <div 
                                key={service.id}
                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-300 border-b-4 hover:shadow-lg transition-shadow flex-1"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                                        {service.title}
                                    </h3>
                                    <div className="bg-white rounded-full p-2 border border-gray-300">
                                        <ArrowUpRight className="w-5 h-5 text-gray-700" />
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