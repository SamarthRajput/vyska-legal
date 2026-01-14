interface CompanyStats {
    yearsExperience?: string | null;
    successRate?: string | null;
    trustedClients?: string | null;
    casesWon?: string | null;
}

export default function WhyVyskaExists({ companyStats }: { companyStats?: CompanyStats | null }) {
    const stats = [
        { value: companyStats?.yearsExperience || "25+", label: "Years of experience" },
        { value: companyStats?.successRate || "98%", label: "Success rate" },
        { value: companyStats?.trustedClients || "150+", label: "Trusted clients" },
        { value: companyStats?.casesWon || "500+", label: "Cases won" }
    ]


    return (
        <section className="relative overflow-hidden bg-gray-50 overflow-x-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative bg-gray-50 flex items-center py-12 sm:py-16 md:py-20 lg:py-0 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
                    <div className="space-y-4 sm:space-y-6 md:space-y-8 w-full">
                        <div className="border-l-4 border-blue-600 pl-4 sm:pl-6 md:pl-8">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
                                Why Vyska exists?
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
                                Learn how our journey, values, and victories shape the way we serve you today.
                            </p>
                        </div>

                        <div>
                            <p className="text-sm sm:text-base md:text-lg text-gray-700">
                                Founded in New Delhi over 25 years ago,{' '}
                                <span className="text-blue-600 font-semibold">Vyska Legal</span>{' '}
                                has grown from a single practice into a trusted, full-service law firm serving clients across 6 cities.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 pt-4 sm:pt-6">
                            {stats.map((stat, index) => (
                                <div key={index}>
                                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-1 sm:mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs sm:text-sm md:text-base text-gray-700">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-auto">
                    <div
                        className="hidden lg:block h-full"
                        style={{
                            clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)'
                        }}
                    >
                        <video
                            className="object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/vdo.mp4" type="video/mp4" />
                            <source src="/vdo.webm" type="video/webm" />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <div className="lg:hidden h-full">
                        <video
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            <source src="/vdo.mp4" type="video/mp4" />
                            <source src="/vdo.webm" type="video/webm" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        </section>
    )
}